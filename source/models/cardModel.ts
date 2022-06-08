import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType } from "sequelize-typescript"
export interface CardI{
    id: any
    card_id: any
}

@Table(
    {
        tableName: 'cards',
        timestamps: true
    }
)

export default class card extends Model implements CardI{
    @AutoIncrement
    @PrimaryKey
    @AllowNull(false)
    @Column(DataType.INTEGER)
    id!: any;

    @Column(DataType.TEXT)
    card_id!: any;
}