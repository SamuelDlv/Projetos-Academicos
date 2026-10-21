package br.com.aula.loja.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "curso")
public class Curso {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_curso")
    private Long id;
    @Column(nullable = false, length = 100) private String nome;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_professor", nullable = false)
    private Professor professor;
    @OneToMany(mappedBy = "curso") private List<Aluno> alunos = new ArrayList<>();
    public Curso() { }
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public Professor getProfessor() { return professor; }
    public void setNome(String nome) { this.nome = nome; }
    public void setProfessor(Professor professor) { this.professor = professor; }
}
