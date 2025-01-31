const request = require('request-promise-native')
const express = require('express');
const app = express();
const archiver = require('archiver');
const Swagger = require('swagger-client');
const {URL} = require('url');
const bodyparser = require('body-parser');

const {
  KALEIDO_REST_GATEWAY_URL,
  KALEIDO_AUTH_USERNAME,
  KALEIDO_AUTH_PASSWORD,
  PORT,
  FROM_ADDRESS,
  CONTRACT_MAIN_SOURCE_FILE,
  CONTRACT_CLASS_NAME
} = require('./config');

let swaggerClient; // Initialized in init()

let contractAddress;

app.use(bodyparser.json());

app.post('/api/reviewBook', async (req, res) => {
  try {
    let postRes = await swaggerClient.apis.default.reviewBook_post({
      address: contractAddress,
      body: {
        bookId: req.body.bookId,
        stars: req.body.stars
      },
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    });
    res.status(200).send(postRes.body)
  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`});
  }
});

app.get('/api/getAllBooks', async (req, res) => {
  try {
    let getRes = await swaggerClient.apis.default.getAllBooks_get({
      address: contractAddress,
      body: {
        books: req.body.bookList
      },
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    });
    res.status(200).send(getRes.body)
  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`});
  }
});

app.get('/api/getBook/:key', async (req, res) => {
  try {
    let getRes = await swaggerClient.apis.default.getBook_get({
      address: contractAddress,
      body: {
        books: req.body.x
      },
      key: req.params.key,
      "kld-from": FROM_ADDRESS,
      "kld-sync": "true"
    });
    res.status(200).send(getRes.body)
  }
  catch(err) {
    res.status(500).send({error: `${err.response && JSON.stringify(err.response.body) && err.response.text}\n${err.stack}`});
  }
});

async function init() {

  // Kaleido example for compilation of your Smart Contract and generating a REST API
  // --------------------------------------------------------------------------------
  // Sends the contents of your contracts directory up to Kaleido on each startup.
  // Kaleido compiles you code and turns into a REST API (with OpenAPI/Swagger).
  // Instances can then be deployed and queried using this REST API
  // Note: we really only needed when the contract actually changes.  
  const url = new URL(KALEIDO_REST_GATEWAY_URL);
  url.username = KALEIDO_AUTH_USERNAME;
  url.password = KALEIDO_AUTH_PASSWORD;
  url.pathname = "/abis";
  var archive = archiver('zip');  
  archive.directory("contracts", "");
  await archive.finalize();
  let res = await request.post({
    url: url.href,
    qs: {
      compiler: "0.5", // Compiler version
      source: CONTRACT_MAIN_SOURCE_FILE, // Name of the file in the directory
      contract: `${CONTRACT_MAIN_SOURCE_FILE}:${CONTRACT_CLASS_NAME}` // Name of the contract in the 
    },
    json: true,
    headers: {
      'content-type': 'multipart/form-data',
    },
    formData: {
      file: {
        value: archive,
        options: {
          filename: 'smartcontract.zip',
          contentType: 'application/zip',
          knownLength: archive.pointer()    
        }
      }
    }
  });
  // Log out the built-in Kaleido UI you can use to exercise the contract from a browser
  url.pathname = res.path;
  url.search = '?ui';
  console.log(`Generated REST API: ${url}`);
  
  // Store a singleton swagger client for us to use
  swaggerClient = await Swagger(res.openapi, {
    requestInterceptor: req => {
      req.headers.authorization = `Basic ${Buffer.from(`${KALEIDO_AUTH_USERNAME}:${KALEIDO_AUTH_PASSWORD}`).toString("base64")}`;
    }
  });

  // Start listening
  app.listen(PORT, () => console.log(`Kaleido DApp backend listening on port ${PORT}!`))

  let postRes = await swaggerClient.apis.default.constructor_post({
    body: {},
    "kld-from": FROM_ADDRESS,
    "kld-sync": "true"
  });

  contractAddress = postRes.body.contractAddress;
  console.log("Deployed instance: " + postRes.body.contractAddress);
}

init().catch(err => {
  console.error(err.stack);
  process.exit(1);
});
  
module.exports = {
  app
};
