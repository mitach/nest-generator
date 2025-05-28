import { Controller, Get } from '@nestjs/common'
import { FeaturesService } from './features.service'
import { FeatureNode } from './dto/feature-tree.dto'

@Controller('api/features')
export class FeaturesController {
    constructor(private readonly featuresService: FeaturesService) { }

    @Get()
    async getFeatureTree(): Promise<FeatureNode[]> {
        return this.featuresService.getFeatures()
    }
}
