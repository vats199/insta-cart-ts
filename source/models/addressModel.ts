import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType, Default } from "sequelize-typescript"
export interface AddressI{
    id: any,
    addressInfo: any
    icon: any
    address_type: any
    latitude: any
    longitude: any
    is_active: any
}

@Table(
    {
        tableName: 'addresses',
        timestamps: true
    }
)

export default class Address extends Model implements AddressI{
    @AutoIncrement
    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: any;

    @Column(DataType.TEXT)
    addressInfo!: any;
    
    @Column(DataType.TEXT)
    icon!: any;

    @Default(0)
    @Column(DataType.TINYINT)
    address_type!: any;

    @Column(DataType.DECIMAL(10,7))
    latitude!: any;

    @Column(DataType.DECIMAL(10,7))
    longitude!: any;

    @Default(false)
    @Column(DataType.BOOLEAN)
    is_active!: any;
}