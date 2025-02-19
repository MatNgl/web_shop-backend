import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Renvoie un utilisateur ou undefined (conversion de null en undefined)
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user || undefined;
  }

  async create(userData: any): Promise<User> {
    if (Array.isArray(userData)) {
      userData = userData[0];
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(user);
    return Array.isArray(savedUser) ? savedUser[0] : savedUser;
  }

  // Mise à jour du profil (hors mot de passe)
  async updateProfile(userId: number, updateData: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(userId, updateData);
    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    return updatedUser;
  }

  // Mise à jour du mot de passe
  async updatePassword(
    userId: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    const { oldPassword, newPassword, confirmPassword } = updatePasswordDto;
    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
    }

    const user = await this.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Ancien mot de passe incorrect');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await this.usersRepository.update(userId, { password: hashedPassword });
    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new UnauthorizedException('Erreur lors de la mise à jour du mot de passe');
    }
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
