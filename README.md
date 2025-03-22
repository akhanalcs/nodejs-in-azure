# nodejs-in-azure
Using NodeJs in Azure.

## Azure Functions
https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview?pivots=programming-language-javascript

Azure Functions is a serverless solution that allows you to write less code, maintain less infrastructure, and save on costs.

Functions provides a comprehensive set of **event-driven triggers and bindings** that connect your functions to other services 
without having to write extra code.


## azd

### Commands
#### azd env new <env-name>
After this you can then run `azd up` and it will provision to the subscription of your choice, and you have
a sandbox environment ready to go.

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
AZURE_SUBSCRIPTION_ID="8824a121-58be-47f3-b1cf-1ef308bacd6a"
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