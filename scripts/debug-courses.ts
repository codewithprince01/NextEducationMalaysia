import { malaysiaDiscoveryService } from '../src/backend/services/malaysia-discovery.service'

async function main() {
  console.log('Testing malaysiaDiscoveryService.getCoursesInMalaysia()...')
  try {
    const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
      page: 1
    })
    console.log('Success!')
    console.log('Filters:', Object.keys(result.filters))
  } catch (error: any) {
    console.error('FAILED with error:')
    console.error(error)
    if (error.stack) console.error(error.stack)
  }
}

main()
