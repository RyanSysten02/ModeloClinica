import { ApiConfig } from '../api/config';

class TurmaService {
  static baseURL = '/turma';
  static endpoints = {
    findAll: () => `${this.baseURL}/list`,
    findById: (id) => `${this.baseURL}/${id}`,
    create: () => `${this.baseURL}/create`,
    update: (id) => `${this.baseURL}/update/${id}`,
    delete: (id) => `${this.baseURL}/delete/${id}`,
    listStudents: (id) => `${this.baseURL}/list/students/${id}`,
  };

  static async findAll() {
    const { data } = await ApiConfig.get(this.endpoints.findAll());
    return data;
  }

  static async findById(id) {
    const { data } = await ApiConfig.get(this.endpoints.findById(id));
    return data;
  }

  static async create(formData) {
    const { data } = await ApiConfig.post(this.endpoints.create(), formData);
    return data;
  }

  static async update(id, formData) {
    const { data } = await ApiConfig.put(this.endpoints.update(id), formData);
    return data;
  }

  static async delete(id) {
    await ApiConfig.delete(this.endpoints.delete(id));
  }

  static async listStudents(id) {
    const { data } = await ApiConfig.get(this.endpoints.listStudents(id));

    return data;
  }
}

export default TurmaService;
