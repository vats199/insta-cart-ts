import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType, Default } from "sequelize-typescript"
export interface OrderI{
    id: any,
    status: any
    order_type: any
    delivery_time: any
    amount: any
    discount_amount: any
    country_code: any
    phone_number: any
    instructions: any
    net_amount: any
    is_gift: any
}

@Table(
    {
        tableName: 'orders',
        timestamps: true
    }
)

export default class order extends Model implements OrderI{
    @AutoIncrement
    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: any;

    @Column(DataType.TINYINT)
    status!: any;
    
    @Column(DataType.ENUM('Delivery', 'PickUp'))
    order_type!: any;

    @Column(DataType.DATE)
    delivery_time!: any;

    @Column(DataType.FLOAT)
    amount!: any;

    @Column(DataType.FLOAT)
    discount_amount!: any;

    @Column(DataType.STRING)
    country_code!: any;

    @Column(DataType.STRING)
    phone_number!: any;

    @Column(DataType.STRING)
    instructions!: any;


    @Column(DataType.FLOAT)
    net_amount!: any;

    @Default(false)
    @Column(DataType.BOOLEAN)
    is_gift!: any;
}