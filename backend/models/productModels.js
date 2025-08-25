import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;
const Products = db.define('products',{
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    url: DataTypes.STRING
},{ freezeTableName: true});

export default Products;

(async()=>{
    await db.sync();
})();