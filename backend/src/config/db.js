import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: "postgres",
        logging: false,

        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

export const connectDatabase = async () => {
    try {
        await sequelize.authenticate();

        console.log("✓ PostgreSQL database connected");
    } catch (error) {
        console.error("✗ PostgreSQL connection failed:", error.message);

        throw error;
    }
};

export default sequelize;