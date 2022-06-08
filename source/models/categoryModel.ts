import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType } from "sequelize-typescript"
export interface CategoryI{
    id: any
    title: any
    image: any
}

@Table(
    {
        tableName: 'categories',
        timestamps: true
    }
)

export default class Category extends Model implements CategoryI{
    @AutoIncrement
    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: any;

    @Column(DataType.STRING)
    title!: any;

    @Column(DataType.TEXT)
    image!: any;
}