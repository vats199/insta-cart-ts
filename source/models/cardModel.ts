import { Model, AllowNull, AutoIncrement, Column, PrimaryKey, Table, DataType } from "sequelize-typescript"
export interface CardI{
    id: number
    card_id: string
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
    @Column
    id!: number;

    @Column
    card_id!: string;
}