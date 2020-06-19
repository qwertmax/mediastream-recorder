const AWS_ALBUM_BUCKET_NAME = "lung.audio";
const AWS_BUCKET_REGION = "us-east-2";
const AWS_IDENTITY_POOL_ID = "us-east-2:ec444e27-ba6c-4aca-9e46-92e779267776";
const AWS_ACL = "bucket-owner-full-control";

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

const updateAWSConfig = () => {
  return window.AWS.config.update({
    region: AWS_BUCKET_REGION,
    credentials: new window.AWS.CognitoIdentityCredentials({
      IdentityPoolId: AWS_IDENTITY_POOL_ID,
    }),
    httpOptions: {
      timeout: 300000,
    },
  });
};

export const sendVoiceToAWS = async (payload) => {
  if (!window.AWS) return delay(200).then(() => sendVoiceToAWS(payload));

  await updateAWSConfig();

  const { name, blob } = payload;

  const upload = new window.AWS.S3.ManagedUpload({
    partSize: 1024 * 1024 * 1024,
    queueSize: 1,
    params: {
      Bucket: AWS_ALBUM_BUCKET_NAME,
      Key: name,
      Body: blob,
      ACL: AWS_ACL,
    },
  });

  return upload
    .promise()
    .catch(({ message }) => console.error(`uploading is failed: ${message}`));
};
