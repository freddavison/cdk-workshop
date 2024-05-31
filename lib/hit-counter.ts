import {Code, Function, IFunction, Runtime} from 'aws-cdk-lib/aws-lambda';
import {Construct} from 'constructs';
import {AttributeType, Table} from 'aws-cdk-lib/aws-dynamodb';
import {RemovalPolicy} from 'aws-cdk-lib';

export interface HitCounterProps {
    downstream: IFunction
}

export class HitCounter extends Construct {
    public readonly handler: Function

    public readonly table: Table

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        const table = new Table(this, 'Hits', {
            partitionKey: {name: 'path', type: AttributeType.STRING},
            removalPolicy: RemovalPolicy.DESTROY
        })
        this.table = table

        this.handler = new Function(this, 'HitCounterHandler', {
            runtime: Runtime.NODEJS_16_X,
            handler: 'hit-counter.handler',
            code: Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        })

        table.grantReadWriteData(this.handler)

        props.downstream.grantInvoke(this.handler)
    }
}