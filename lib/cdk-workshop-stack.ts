import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import {LambdaRestApi} from 'aws-cdk-lib/aws-apigateway';
import {HitCounter} from './hit-counter';
import {TableViewer} from 'cdk-dynamo-table-viewer'

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hello = new Function(this, 'HelloHandler', {
      runtime: Runtime.NODEJS_LATEST,
      code: Code.fromAsset('lambda'),
      handler: 'hello.handler'
    })

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    })

    new LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    })

    new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: helloWithCounter.table,
      sortBy: '-hits'
    })
  }
}
