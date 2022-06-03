import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType } from "sequelize-typescript"
// import { Model, TableHints } from "sequelize/types"
export interface TokenI{
    id: any
    accessToken: any
    refreshToken: any
    login_count: any
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
    @Column(DataType.INTEGER)
    id!: any;

    @Column(DataType.TEXT)
    accessToken!: any;

    @Column(DataType.TEXT)
    refreshToken!: any;

    @Column(DataType.INTEGER)
    login_count!: any;
}