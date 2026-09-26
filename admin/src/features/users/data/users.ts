import { faker } from '@faker-js/faker'
import { type User } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(67890)

export const users: User[] = Array.from({ length: 20 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const authProvider = faker.helpers.arrayElement(['google', 'local'] as const)

  return {
    id: faker.string.uuid(),
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    status: faker.helpers.arrayElement(['active', 'inactive', 'invited', 'suspended'] as const),
    authProvider,
    profilePicture: authProvider === 'google' ? faker.image.avatar() : '',
    role: faker.helpers.arrayElement(['admin', 'user'] as const),
    isProUser: faker.datatype.boolean(),
    uploadedComponentsCount: faker.number.int({ min: 0, max: 25 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
