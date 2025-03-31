# nodejs-in-azure
Using NodeJs in Azure.

## Azure Functions
https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview?pivots=programming-language-javascript

Azure Functions is a serverless solution that allows you to write less code, maintain less infrastructure, and save on costs.

Functions provides a comprehensive set of **event-driven triggers and bindings** that connect your functions to other services 
without having to write extra code.

## Check out sample apps (JS)
Common Scenarios:  
https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview?pivots=programming-language-javascript

Developer guide:  
https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference?tabs=blob&toc=%2Fazure%2Fdeveloper%2Fjavascript%2Ftoc.json&bc=%2Fazure%2Fdeveloper%2Fjavascript%2Fbreadcrumb%2Ftoc.json&pivots=programming-language-javascript

Flex consumption samples:  
https://learn.microsoft.com/en-us/samples/azure-samples/azure-functions-flex-consumption-samples/azure-functions-flex-consumption-samples/

Azure Functions HTTP trigger reference sample written in TypeScript:  
https://learn.microsoft.com/en-us/samples/azure-samples/functions-quickstart-typescript-azd/functions-quickstart-typescript-azd/

Quickstart: Create and deploy functions to Azure Functions using the Azure Developer CLI:  
https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-azure-developer-cli?pivots=programming-language-typescript&tabs=linux%2Cget%2Cbash%2Cpowershell

Azure Storage Blob client library samples for TypeScript:  
https://learn.microsoft.com/en-us/samples/azure/azure-sdk-for-js/storage-blob-typescript/

Azure Data Lake Storage client library samples for TypeScript:  
https://learn.microsoft.com/en-us/samples/azure/azure-sdk-for-js/storage-file-datalake-typescript/

Azure TypeScript apps:  
https://learn.microsoft.com/en-us/samples/azure-samples/azure-typescript-e2e-apps/azure-typescript-e2e-apps/



## Check out sample apps (C#)
https://github.com/Azure-Samples/functions-quickstart-dotnet-azd

### How to deploy
https://github.com/Azure-Samples/functions-quickstart-dotnet-azd

The main.bicep template defines the infrastructure for an Azure Functions app with the following components:

- Resource Group
- Azure Functions App (isolated .NET 8 runtime)
- Storage Account (required for Functions)
- App Service Plan (Consumption plan)
- User-assigned Managed Identity
- Application Insights
- Optional Virtual Network with private endpoints

## Azure Functions Deployment Best Practices

### Storage Account Role

Storage accounts are essential for Azure Functions as they store:
- Function code and deployment packages
- Function execution logs
- Trigger and binding data

This template creates a storage account and assigns appropriate permissions using managed identities.

# Azure Functions Deployment Architecture and Best Practices

## Virtual Network with Private Endpoints Explained

Private endpoints create a private IP address for Azure services (like Storage) within your VNet, providing:

- Network isolation from public internet
- Protection from data exfiltration risks
- Compliance with security requirements
- Secure access to Azure resources from on-premises via ExpressRoute/VPN

In this template (lines 117-138), when `skipVnet=false`, storage accounts are configured with private endpoints and public network access is disabled.

## Multi-Stage Deployment with Azure DevOps

### Pipeline Structure Example

```yaml
trigger:
  branches:
    include:
    - main
    - dev

variables:
  vmImageName: 'ubuntu-latest'

stages:
- stage: Build
  jobs:
  - job: Build
    pool:
      vmImage: $(vmImageName)
    steps:
    - task: DotNetCoreCLI@2
      displayName: 'Build Function App'
      inputs:
        command: 'build'
        projects: '**/*.csproj'
        arguments: '--configuration Release'
        
    - task: DotNetCoreCLI@2
      displayName: 'Publish Function App'
      inputs:
        command: 'publish'
        publishWebProjects: false
        projects: '**/*.csproj'
        arguments: '--configuration Release --output $(Build.ArtifactStagingDirectory)'
        zipAfterPublish: true
        
    - task: PublishBuildArtifacts@1
      inputs:
        pathToPublish: '$(Build.ArtifactStagingDirectory)'
        artifactName: 'drop'

- stage: DeployToDev
  dependsOn: Build
  condition: succeeded()
  jobs:
  - deployment: DeployFunction
    environment: 'dev'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureResourceManagerTemplateDeployment@3
            inputs:
              deploymentScope: 'Subscription'
              azureResourceManagerConnection: 'Your-Azure-Connection'
              subscriptionId: '$(subscriptionId)'
              location: 'eastus'
              templateLocation: 'Linked artifact'
              csmFile: '$(Pipeline.Workspace)/drop/infra/main.bicep'
              overrideParameters: '-environmentName dev -location eastus'
              deploymentMode: 'Incremental'
          
          - task: AzureFunctionApp@1
            inputs:
              azureSubscription: 'Your-Azure-Connection'
              appType: 'functionApp'
              appName: '$(functionAppName)'
              package: '$(Pipeline.Workspace)/drop/*.zip'
              deploymentMethod: 'auto'

- stage: DeployToTest
  dependsOn: DeployToDev
  jobs:
  - deployment: DeployFunction
    environment: 'test'
    strategy:
      runOnce:
        deploy:
          steps:
          # Similar steps as dev but with test parameters
          
- stage: DeployToProd
  dependsOn: DeployToTest
  jobs:
  - deployment: DeployFunction
    environment: 'prod'
    strategy:
      runOnce:
        deploy:
          steps:
          # Similar steps as test but with prod parameters
```

### Key Vault Integration

Add this module to the Bicep template:

```bicep
module keyVault './core/security/keyvault.bicep' = {
  name: 'keyVault'
  scope: rg
  params: {
    name: '${abbrs.keyVaultVaults}${resourceToken}'
    location: location
    principalId: apiUserAssignedIdentity.outputs.identityPrincipalId
  }
}
```

Then update the function app settings to reference secrets:

```bicep
appSettings: {
  'MySecret': '@Microsoft.KeyVault(SecretUri=https://${keyVault.outputs.name}.vault.azure.net/secrets/MySecret/)'
}
```

## Environment Selection in CI/CD

Your approach with approvals between environments is correct. In Azure DevOps:

1. The pipeline builds once, creating an artifact containing your function code
2. Environment variables in each stage inject appropriate settings
3. Approvals are configured in the Azure DevOps environment settings
4. The resource group name is parameterized based on environment:
   ```
   resourceGroupName: 'rg-function-${environmentName}'
   ```

## Deployment Slots for Zero-Downtime

Azure Functions Premium plan supports deployment slots. The process works like:

1. Deploy new version to staging slot
2. Run automated tests against staging slot
3. When verified, swap slots (production <-> staging)

In the pipeline:

```yaml
- task: AzureFunctionAppSlot@1
  inputs:
    azureSubscription: 'Your-Azure-Connection'
    appType: 'functionApp'
    appName: '$(functionAppName)'
    deployToSlotOrASE: true
    resourceGroupName: '$(resourceGroup)'
    slotName: 'staging'
    package: '$(Pipeline.Workspace)/drop/*.zip'
    
- task: AzureAppServiceManage@0
  inputs:
    azureSubscription: 'Your-Azure-Connection'
    Action: 'Swap Slots'
    WebAppName: '$(functionAppName)'
    ResourceGroupName: '$(resourceGroup)'
    SourceSlot: 'staging'
```

Note: For Consumption plan, you'd need to implement blue-green deployment with separate function apps instead of slots.

## azd


### Commands
#### azd env new <env-name>
After this you can then run `azd up` and it will provision to the subscription of your choice, and you have
a sandbox environment ready to go.

In `azd`, the environment is used to maintain a unique deployment context for your app.

#### azd up
Does packaging, provisioning, and deployment.

#### azd provision
When you've made changes to your IaC, you can run `azd provision` to provision/update the resources in Azure.

Preview using `azd provision preview`.

#### azd deploy
When you're making changes to your code, you can run `azd deploy` to update the code in Azure.
It **packages** the code and **deploys** it to Azure. It doesn't go through the provisioning step.

Sometimes it's just convenient to run `azd up`.

#### azd env list
```bash
Ashishs-MacBook-Pro:todo-nodejs-mongo-swa-func ashishkhanal$ azd env list
NAME      DEFAULT   LOCAL     REMOTE
dev       true      true      false
```

#### azd down
When you're done with your environment, you can run `azd down` to delete the resources in Azure.

#### azd env get-values
```bash
Ashishs-MacBook-Pro:todo-nodejs-mongo-swa-func ashishkhanal$ azd env get-values
AZURE_ENV_NAME="dev"
AZURE_SUBSCRIPTION_ID="1234hjui-899m-5648-ghs3-9jnegy7p6hn3"
```
Values in `.azure/dev/.env` file.

#### azd show
```bash
Ashishs-MacBook-Pro:todo-nodejs-mongo-swa-func ashishkhanal$ azd show

Showing services and environments for apps in this directory.
To view a different environment, run azd show -e <environment name>

todo-nodejs-mongo-swa-func
  Services:
    web  
    api  
  Environments:
    dev [Current]
  View in Azure Portal:
    Application is not yet provisioned. Run azd provision or azd up first.
```

### CI/CD pipeline using azd
Simple pipeline:
https://github.com/Azure-Samples/todo-nodejs-mongo-swa-func/blob/main/azure.yaml

It just does `provision` (provision infrastructure) and `deploy` (package and deploy).

But if we're doing multi-stage pipeline, we'll run `azd package` in our build pipeline, we upload/save that as
an artifact, and then in the release pipeline, we'll download that artifact and deploy that to dev,
staging, and production.