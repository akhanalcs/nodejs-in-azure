# azd
Reference: https://youtu.be/OD0_nP9QB6g?si=Qoz7YVSJR2xsjDhC

Official docs: https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd?tabs=winget-windows%2Cbrew-mac%2Cscript-linux&pivots=os-mac

TODO: Move azd stuffs to "iac-on-azure" repo.
Currently, it's also on "react-aspnetcore-bff" repo, so it's scattered and messy.

## Commands
### azd env new <env-name>
After this you can then run `azd up` and it will provision to the subscription of your choice, and you have
a sandbox environment ready to go.

In `azd`, the environment is used to maintain a unique deployment context for your app.

### azd up
Does packaging, provisioning, and deployment.

### azd provision
When you've made changes to your IaC, you can run `azd provision` to provision/update the resources in Azure.

Preview using `azd provision preview`.

### azd deploy
When you're making changes to your code, you can run `azd deploy` to update the code in Azure.
It **packages** the code and **deploys** it to Azure. It doesn't go through the provisioning step.

Sometimes it's just convenient to run `azd up`.

### azd env list
```bash
Ashishs-MacBook-Pro:todo-nodejs-mongo-swa-func ashishkhanal$ azd env list
NAME      DEFAULT   LOCAL     REMOTE
dev       true      true      false
```

### azd down
When you're done with your environment, you can run `azd down` to delete the resources in Azure.

### azd env get-values
```bash
Ashishs-MacBook-Pro:todo-nodejs-mongo-swa-func ashishkhanal$ azd env get-values
AZURE_ENV_NAME="dev"
AZURE_SUBSCRIPTION_ID="1234hjui-899m-5648-ghs3-9jnegy7p6hn3"
```
Values in `.azure/dev/.env` file.

### azd show
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

## CI/CD pipeline using azd
Simple pipeline:
https://github.com/Azure-Samples/todo-nodejs-mongo-swa-func/blob/main/azure.yaml

It just does `provision` (provision infrastructure) and `deploy` (package and deploy).

But if we're doing multi-stage pipeline, we'll run `azd package` in our build pipeline, we upload/save that as
an artifact, and then in the release pipeline, we'll download that artifact and deploy that to dev,
staging, and production.