import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType, Default } from "sequelize-typescript"
import { Col } from "sequelize/types/utils";
// import { Model } from "sequelize/types"
export interface UserI{
    id: number
    email: string
    password: string
    firstName: string
    lastName: string
    country_code: string
    phone_number: string
    stripe_id: any
    is_verify: boolean
    is_active: boolean
    resetToken: any
    resetTokenExpiration: any
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
    @Column
    id!: number;

    @AllowNull(false)
    @Column
    email!: string;

    @AllowNull(false)
    @Column
    password!: string;
    
    @Column
    firstName!: string;

    @Column
    lastName!: string;

    @Column
    country_code!: string;

    @Column
    phone_number!: string;

    @Column(DataType.TEXT)
    stripe_id!: any;

    @Default(false)
    @Column
    is_verify!: boolean;

    @Default(false)
    @Column
    is_active!: boolean;

    @Column(DataType.TEXT)
    resetToken!: any;

    @Column(DataType.DATE)
    resetTokenExpiration!: any;
}