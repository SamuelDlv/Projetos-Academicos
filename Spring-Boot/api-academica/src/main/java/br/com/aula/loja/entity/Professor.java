package br.com.aula.loja.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "professor")
public class Professor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_professor")
    private Long id;
    @Column(nullable = false, length = 100) private String nome;
    @Column(nullable = false, unique = true, length = 100) private String email;
    @Column(length = 50) private String departamento;
    @OneToMany(mappedBy = "professor") private List<Curso> cursos = new ArrayList<>();
    public Professor() { }
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getDepartamento() { return departamento; }
    public void setNome(String nome) { this.nome = nome; }
    public void setEmail(String email) { this.email = email; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }
}
