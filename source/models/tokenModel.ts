import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table } from "sequelize-typescript"
// import { Model, TableHints } from "sequelize/types"
export interface TokenI{
    id: number
    token: string
    refreshToken: string
    login_count: number
}

@Table(
    {
        tableName: 'tokens',
        timestamps: true
    }
)

export default class Token extends Model implements TokenI{
    @AutoIncrement
    @PrimaryKey
    @AllowNull(false)
    @Column
    id!: number;

    @Column
    token!: string;

    @Column
    refreshToken!: string;

    @Column
    login_count!: number;
}