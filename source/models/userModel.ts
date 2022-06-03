import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType, Default } from "sequelize-typescript"
// import { Model } from "sequelize/types"
export interface UserI{
    id: any
    email: any
    password: any
    firstName: any
    lastName: any
    country_code: any
    phone_number: any
    stripe_id: any
    is_verify: any
    is_active: any
}

@Table(
    {
        tableName: 'users',
        timestamps: true
    }
)

export default class User extends Model implements UserI{
    @AutoIncrement
    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: any;

    @AllowNull(false)
    @Column(DataType.STRING)
    email!: any;

    @AllowNull(false)
    @Column(DataType.STRING)
    password!: any;

    @Column(DataType.STRING)
    firstName!: any;

    @Column(DataType.STRING)
    lastName!: any;

    @Column(DataType.STRING)
    country_code!: any;

    @Column(DataType.STRING)
    phone_number!: any;

    @Column(DataType.TEXT)
    stripe_id!: any;

    @Default(false)
    @Column(DataType.BOOLEAN)
    is_verify!: any;

    @Default(false)
    @Column(DataType.BOOLEAN)
    is_active!: any;
}