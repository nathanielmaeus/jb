import { Handler } from "@netlify/functions";
import { getMessages } from "../../server/services/messages";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
};

const handler: Handler = async (event) => {
  const params = event.queryStringParameters;

  if (!params) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "mandatory parameters are missing" }),
    };
  }

  const size = params.size;
  const lastMessageId = params.lastMessageId;

  const id = lastMessageId === "" ? null : Number(lastMessageId);
  const currentSize = size === "" ? 100 : Number(size);

  const data = await getMessages({ lastMessageId: id, size: currentSize });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data),
  };
};

export { handler };
