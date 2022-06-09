import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType } from "sequelize-typescript"
export interface CategoryI{
    id: number
    title: string
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
    @Column
    id!: number;

    @Column
    title!: string;

    @Column(DataType.TEXT)
    image!: any;
}