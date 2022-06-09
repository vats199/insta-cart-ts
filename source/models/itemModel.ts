import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType } from "sequelize-typescript"
export interface ItemI{
    id: number
    title: string
    bio: any
    image: any
    price: number
}

@Table(
    {
        tableName: 'items',
        timestamps: true
    }
)

export default class item extends Model implements ItemI{
    @AutoIncrement
    @PrimaryKey
    @AllowNull(false)
    @Column
    id!: number;

    @Column
    title!: string;

    @Column(DataType.TEXT)
    bio!: any;

    @Column(DataType.TEXT)
    image!: any;

    @Column
    price!: number;
}