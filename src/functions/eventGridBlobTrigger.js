const { app } = require('@azure/functions');

app.storageBlob('eventGridBlobTrigger', {
    path: 'samples-workitems/{name}',
    source: 'EventGrid',
    connection: '1fa19e_STORAGE',
    handler: (blob, context) => {
        context.log(`Storage blob (using Event Grid) function processed blob "${context.triggerMetadata.name}" with size ${blob.length} bytes`);
    }

});

//

