import expressLoader from "./expressLoader";
import sequelizeLoader from "./sequelizeLoader";
import * as dotenv from "dotenv";
export default async ({ expressApp }: any) => {
  dotenv.config();
  const seqConnection = await sequelizeLoader();
  console.log("Database Connected Successfully.");

  await expressLoader({ app: expressApp });
  console.log("Express initialized Successfully.");
};
