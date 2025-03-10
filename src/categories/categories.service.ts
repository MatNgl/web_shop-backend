import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SousCategorie } from './entities/sous-categorie.entity';
import { CreateSousCategorieDto } from './dto/create-sous-categorie.dto';
import { UpdateSousCategorieDto } from './dto/update-sous-categorie.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(SousCategorie)
    private readonly sousCategorieRepository: Repository<SousCategorie>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: ['sousCategories'],
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['sousCategories'],
    });
    if (!category) {
      throw new NotFoundException(`Catégorie #${id} introuvable`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.preload({
      id: id,
      ...updateCategoryDto,
    });
    if (!category) {
      throw new NotFoundException(`Catégorie #${id} introuvable`);
    }
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Catégorie #${id} introuvable`);
    }
  }

  // Méthode pour récupérer les sous-catégories d'une catégorie
  async getSubCategories(categoryId: number): Promise<SousCategorie[]> {
    return await this.sousCategorieRepository.find({
      where: { categorie: { id: categoryId } },
    });
  }

  // Méthode pour créer une sous-catégorie pour une catégorie donnée
  async createSubCategory(
    categoryId: number,
    createSousCategorieDto: CreateSousCategorieDto,
  ): Promise<SousCategorie> {
    const category = await this.findOne(categoryId);
    if (!category) {
      throw new NotFoundException(`Catégorie #${categoryId} introuvable`);
    }
    const sousCategorie = this.sousCategorieRepository.create(
      createSousCategorieDto,
    );
    sousCategorie.categorie = category;
    return await this.sousCategorieRepository.save(sousCategorie);
  }

  // Méthode pour mettre à jour une sous-catégorie
  async updateSubCategory(
    subId: number,
    updateSousCategorieDto: UpdateSousCategorieDto,
  ): Promise<SousCategorie> {
    const sousCategorie = await this.sousCategorieRepository.preload({
      id: subId,
      ...updateSousCategorieDto,
    });
    if (!sousCategorie) {
      throw new NotFoundException(`Sous-catégorie #${subId} introuvable`);
    }
    return await this.sousCategorieRepository.save(sousCategorie);
  }

  // Méthode pour supprimer une sous-catégorie
  async removeSubCategory(subId: number): Promise<void> {
    const result = await this.sousCategorieRepository.delete(subId);
    if (result.affected === 0) {
      throw new NotFoundException(`Sous-catégorie #${subId} introuvable`);
    }
  }
}
