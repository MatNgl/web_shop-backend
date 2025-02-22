/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

  // Méthode trouver user par email
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user || undefined;
  }
  // Méthode trouver user par id
  async findById(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user || undefined;
  }
  // Méthode créer user
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
  // Méthode suppression user
  async updateProfile(
    userId: number,
    updateData: UpdateUserDto,
  ): Promise<User> {
    await this.usersRepository.update(userId, updateData);
    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    return updatedUser;
  }

  // Méthode update password
  async updatePassword(
    userId: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    const { oldPassword, newPassword, confirmPassword } = updatePasswordDto;
    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException(
        'Les mots de passe ne correspondent pas.',
      );
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
      throw new UnauthorizedException(
        'Erreur lors de la mise à jour du mot de passe',
      );
    }
    return updatedUser;
  }

  // Méthode suppression user
  async deleteUser(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Méthode pour trouver un utilisateur par token de réinitialisation
  async findByResetToken(token: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
    return user || undefined;
  }

  // Méthode générique d'update utilisée par le service Auth pour le reset password
  async update(userId: number, updateData: Partial<User>): Promise<void> {
    await this.usersRepository.update(userId, updateData);
  }
}
