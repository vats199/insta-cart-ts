import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType } from "sequelize-typescript"
export interface ItemI{
    id: any
    title: any
    bio: any
    image: any
    price: any
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
    @Column(DataType.INTEGER)
    id!: any;

    @Column(DataType.STRING)
    title!: any;

    @Column(DataType.TEXT)
    bio!: any;

    @Column(DataType.TEXT)
    image!: any;

    @Column(DataType.FLOAT)
    price!: any;
}