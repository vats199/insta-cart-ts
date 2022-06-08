import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType, Default } from "sequelize-typescript"
export interface StoreI{
    id: any,
    name: any
    bio: any
    image: any
    store_type: any
    delivery_type: any
    address: any
    latitude: any
    longitude: any
}

@Table(
    {
        tableName: 'stores',
        timestamps: true
    }
)

export default class Store extends Model implements StoreI{
    @AutoIncrement
    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: any;

    @Column(DataType.STRING)
    name!: any;
    
    @Column(DataType.TEXT)
    bio!: any;

    @Column(DataType.TEXT)
    image!: any;

    @Column(DataType.STRING)
    store_type!: any;

    @Column(DataType.TINYINT)
    delivery_type!: any;

    @Column(DataType.TEXT)
    address!: any;

    @Column(DataType.DECIMAL(10,7))
    latitude!: any;

    @Column(DataType.DECIMAL(10,7))
    longitude!: any;
}