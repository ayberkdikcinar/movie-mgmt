import { Repository } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { UserEntity } from '@src/users/entity/user.entity';
import { Role } from '@src/users/types/enum/role';
import * as request from 'supertest';

export async function createTestUserAndAuthenticate(
  app: INestApplication,
  userRepository: Repository<UserEntity>,
  role: Role,
): Promise<{ token: string; userId: string }> {
  let userId = '';
  const username = `test-user-${role}`;
  const existingUser = await userRepository.findOne({ where: { username } });
  if (existingUser) {
    userId = existingUser.id;
  }
  if (!existingUser) {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        username,
        password: 'testpassword',
        age: 18,
        role: role,
      });
    userId = response.body.id;
  }

  const userResponse = await request(app.getHttpServer())
    .post('/auth/signin')
    .send({ username, password: 'testpassword' });

  return { token: userResponse.body.access_token, userId: userId };
}
