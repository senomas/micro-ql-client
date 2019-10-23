import * as crypto from 'crypto';
import gql from 'graphql-tag';
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

export async function login(ctx, login, password) {
  ecdh.generateKeys();
  const auth = {
    serverKey: Buffer.from(
      (await ctx.$apollo.query({
        query: gql`
        query loginGetServerKey {
          auth(clientKey: "${ecdh.getPublicKey().toString('base64')}") {
            serverKey
          }
        }`,
        fetchPolicy: 'network-only'
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
      query loginGetSalt {
        auth(clientKey: "${ecdh.getPublicKey().toString('base64')}") {
          salt(xlogin: "${xlogin}")
        }
      }`,
    fetchPolicy: 'network-only'
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
    query login {
      auth(clientKey: "${ecdh.getPublicKey().toString('base64')}") {
        login(xlogin: "${xlogin}", xhpassword: "${xhpassword}") {
          seq token
        }
      }
    }`,
    fetchPolicy: 'network-only'
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
    query logout {
      logout
    }`,
    fetchPolicy: 'network-only'
  })).data.logout;
}

export function handleGraphqlError(ctx, err) {
  try {
    if (err.networkError) {
      const networkError = err.networkError;
      if (networkError.result && networkError.result.errors) {
        const nerr = networkError.result.errors[0];
        if (nerr.extensions) {
          ctx.setPopupError({
            ...nerr,
            code: nerr.extensions.code,
            action: () => {
              ctx.setMe(null);
            }
          });
          return true;
        }
      }
    } else if (err.graphQLErrors && err.graphQLErrors.length > 0 && err.graphQLErrors[0].extensions && err.graphQLErrors[0].extensions.code) {
      ctx.setPopupError({
        ...err.graphQLErrors[0].extensions,
        errors: err.graphQLErrors
      });
      return true;
    }
  } catch (err2) {
    console.error('handleGraphqlError', { err: err2, originalErr: err });
  }
  return false;
}
