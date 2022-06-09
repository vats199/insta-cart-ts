import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType, Default } from "sequelize-typescript"
export interface StoreI{
    id: number,
    name: string
    bio: any
    image: any
    store_type: string
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
    @Column
    id!: number;

    @Column
    name!: string;
    
    @Column(DataType.TEXT)
    bio!: any;

    @Column(DataType.TEXT)
    image!: any;

    @Column
    store_type!: string;

    @Column(DataType.TINYINT)
    delivery_type!: any;

    @Column(DataType.TEXT)
    address!: any;

    @Column(DataType.DECIMAL(10,7))
    latitude!: any;

    @Column(DataType.DECIMAL(10,7))
    longitude!: any;
}