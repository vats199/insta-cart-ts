import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table } from "sequelize-typescript"
// import { Model } from "sequelize/types"
export interface UserI{
    id: number
    email: string
    password: string
    firstName: string
    lastName: string
    country_code: string
    phone_number: number
    stripe_id: string
    is_verify: boolean
    is_active: boolean
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
    phone_number!: number;

    @Column
    stripe_id!: string;

    @Column
    is_verify!: boolean;

    @Column
    is_active!: boolean;
}