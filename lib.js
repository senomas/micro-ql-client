import * as crypto from 'crypto';
import gql from 'graphql-tag';
// import dateFns from 'date-fns'
import * as jwt from 'jsonwebtoken';

export const config = {
  curves: 'secp256k1',
  salt: 'd3nm4s3n0',
  aesKey: {
    iterations: 3191,
    hashBytes: 32
  },
  aesSalt: {
    iterations: 3297,
    hashBytes: 16
  },
  pbkdf2: {
    iterations: 3573,
    hashBytes: 64
  }
};

export const ecdh = crypto.createECDH(config.curves);
ecdh.generateKeys();

export async function login(ctx, login, password) {
  await ctx.$apolloHelpers.onLogout()
  const auth = {
    serverKey: Buffer.from(
      (await ctx.$apollo.query({
        query: gql`
        {
          auth(clientKey: "${ecdh.getPublicKey().toString('base64')}") {
            serverKey
          }
        }`
      })).data.auth.serverKey,
      'base64'
    )
  };
  auth.secretkey = ecdh.computeSecret(auth.serverKey);
  auth.aesKey = crypto.pbkdf2Sync(
    auth.secretkey,
    config.salt,
    config.aesKey.iterations,
    config.aesKey.hashBytes,
    'sha512'
  );
  auth.aesSalt = crypto.pbkdf2Sync(
    ecdh.getPublicKey(),
    config.salt,
    config.aesSalt.iterations,
    config.aesSalt.hashBytes,
    'sha512'
  );
  let aes = crypto.createCipheriv('aes-256-ctr', auth.aesKey, auth.aesSalt);
  const xlogin = Buffer.concat([
    aes.update(Buffer.from(login, 'utf8')),
    aes.final()
  ]).toString('base64');
  const xsalt = (await ctx.$apollo.query({
    query: gql`
      {
        auth(clientKey: "${ecdh.getPublicKey().toString('base64')}") {
          salt(xlogin: "${xlogin}")
        }
      }`
  })).data.auth.salt;
  const aesd = crypto.createDecipheriv('aes-256-ctr', auth.aesKey, auth.aesSalt);
  const salt = Buffer.from(
    Buffer.concat([
      aesd.update(Buffer.from(xsalt, 'base64')),
      aesd.final()
    ]).toString('utf8'),
    'base64'
  );

  const hpassword = crypto.pbkdf2Sync(
    password,
    salt,
    config.pbkdf2.iterations,
    config.pbkdf2.hashBytes,
    'sha512'
  );

  aes = crypto.createCipheriv('aes-256-ctr', auth.aesKey, auth.aesSalt);
  const xhpassword = Buffer.concat([
    aes.update(hpassword),
    aes.final()
  ]).toString('base64');

  const loginRes = (await ctx.$apollo.query({
    query: gql`
    {
      auth(clientKey: "${ecdh.getPublicKey().toString('base64')}") {
        login(xlogin: "${xlogin}", xhpassword: "${xhpassword}") {
          seq token
        }
      }
    }`
  })).data.auth.login;
  delete loginRes.__typename;
  const obj = jwt.decode(loginRes.token);
  return {
    ...auth,
    ...loginRes,
    clientKey: Buffer.from(obj.ck, 'base64'),
    name: obj.n,
    iat: new Date(obj.iat * 1000),
    exp: new Date(obj.exp * 1000),
    privileges: obj.p
  };
}

export async function logout(ctx) {
  return (await ctx.$apollo.query({
    query: gql`
    {
      logout
    }`
  })).data.logout;
}
