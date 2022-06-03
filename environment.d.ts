declare global {
    namespace NodeJS {
      interface ProcessEnv {
        MYSQL_USER:string;
        MYSQL_PASSWORD:string;
        MYSQL_DATABASE:string;
        secret: string;
        jwtExpiration: string;
        refSecret: string;
        jwtRefExpiration: string;
      }
    }
  }
  export {};