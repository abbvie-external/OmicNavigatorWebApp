import { InnerColumnConfig, ObjectLiteral } from 'src/types';
export type QHGridColumnConfig<Data extends ObjectLiteral, ATI> = InnerColumnConfig<Data, ATI> & {
    QHgridIndex: number;
};
