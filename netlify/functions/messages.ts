import { Handler } from "@netlify/functions";
import { getMessages } from "../../server/messages";

const handler: Handler = async (event) => {
  const params = event.queryStringParameters;

  if (!params) {
    return {
      statusCode: 400,
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
    body: JSON.stringify(data),
  };
};

export { handler };
