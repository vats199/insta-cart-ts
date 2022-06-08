import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType, Default } from "sequelize-typescript"
export interface OrderItemI{
    id: any,
    quantity: any
    itemTotal: any
}

@Table(
    {
        tableName: 'orderitems',
        timestamps: true
    }
)

export default class orderItem extends Model implements OrderItemI{
    @AutoIncrement
    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: any;

    @Column(DataType.INTEGER)
    quantity!: any;
    
    @Column(DataType.FLOAT)
    itemTotal!: any;
}