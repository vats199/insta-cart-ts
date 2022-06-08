import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType } from "sequelize-typescript"
export interface PaymentI{
    id: any
    transaction_id: any
    amount: any
    status: any
}

@Table(
    {
        tableName: 'payments',
        timestamps: true
    }
)

export default class payment extends Model implements PaymentI{
    @AutoIncrement
    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: any;

    @Column(DataType.TEXT)
    transaction_id!: any;

    @Column(DataType.FLOAT)
    amount!: any;

    @Column(DataType.ENUM('PENDING', 'SUCCESS', 'FAILED'))
    status!: any
}