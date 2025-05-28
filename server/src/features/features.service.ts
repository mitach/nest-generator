import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { FeatureNode } from './dto/feature-tree.dto'

@Injectable()
export class FeaturesService {
    private baseDir = path.join(__dirname, '../../templates/features')

    async getFeatures(): Promise<FeatureNode[]> {
        return this.scanDirectory(this.baseDir)
    }

    private async scanDirectory(dir: string): Promise<FeatureNode[]> {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true })

        const results: FeatureNode[] = []

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const featurePath = path.join(dir, entry.name)
                const configPath = path.join(featurePath, 'feature.config.json')

                const hasFeatureConfig = fs.existsSync(configPath)
                if (!hasFeatureConfig) continue

                const children = await this.scanDirectory(featurePath)

                results.push({
                    name: entry.name,
                    path: path.relative(this.baseDir, featurePath).replaceAll('\\', ':'),
                    children: children.length > 0 ? children : undefined,
                })
            }
        }

        return results
    }
}
