package br.com.aula.loja.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "aluno")
public class Aluno {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_aluno")
    private Long id;
    @Column(nullable = false, length = 100) private String nome;
    @Column(nullable = false, unique = true, length = 100) private String email;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_curso", nullable = false)
    private Curso curso;
    public Aluno() { }
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public Curso getCurso() { return curso; }
    public void setNome(String nome) { this.nome = nome; }
    public void setEmail(String email) { this.email = email; }
    public void setCurso(Curso curso) { this.curso = curso; }
}
