"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Mail,
  Linkedin,
  Github,
  ExternalLink,
  Download,
  Code,
  Terminal,
  Zap,
  Database,
  GitBranch,
  GitCommit,
  Star
} from 'lucide-react';

// TypeScript: define types for skills and particles
type SkillsType = Record<string, string[]>;
type SkillWidthsType = Record<string, number[]>;
type Particle = { x: number; y: number; vx: number; vy: number; radius: number };

export default function Portfolio() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [textIndex, setTextIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Store skill bar widths in state so they don't change on every render
  const [skillWidths, setSkillWidths] = useState<SkillWidthsType>({});

  const texts: string[] = [
    'Full Stack Developer',
    'Gen AI',
    'Open Source Contributor',
    'Problem Solver',
    'AI/ML'
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections: string[] = ['home', 'about', 'experience', 'skills', 'projects', 'contact'];
      let currentSection: string = 'home';
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            currentSection = sectionId;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Typing animation debugged: avoid nested setTimeout
  useEffect(() => {
    const typingSpeed: number = isDeleting ? 50 : 100;
    const currentText: string = texts[textIndex];

    let timer: ReturnType<typeof setTimeout>;
    if (!isDeleting && displayText.length < currentText.length) {
      timer = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length + 1));
      }, typingSpeed);
    } else if (!isDeleting && displayText.length === currentText.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText.length > 0) {
      timer = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length - 1));
      }, typingSpeed);
    } else if (isDeleting && displayText.length === 0) {
      setIsDeleting(false);
      setTextIndex((prevIndex: number) => (prevIndex + 1) % texts.length);
    }
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex, texts]);

  // Canvas animation debugged: persist particles using useRef
  const particlesRef = useRef<Particle[]>([]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Initialize particles only once
    if (particlesRef.current.length === 0) {
      const particleCount: number = 80;
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2
        });
      }
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
        ctx.fill();

        particlesRef.current.forEach((otherParticle, j) => {
          if (i === j) return;
          const dx: number = particle.x - otherParticle.x;
          const dy: number = particle.y - otherParticle.y;
          const distance: number = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.2 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationFrameId = window.requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Precompute skill bar widths once
  const skills: SkillsType = {
    'Languages': ['JavaScript', 'TypeScript', 'Python', 'C++'],
    'Frontend': ['React', 'Next.js', 'HTML CSS', 'Tailwind'],
    'Backend': ['Node.js', 'Flask', 'Streamlit', 'Django'],
    'AI & LLM Tools': ['LangChain', 'Hugging Face', 'Gemini/Groq/LLaMA APIs', 'OpenAI']
  };

  useEffect(() => {
    // Only set widths once
    if (Object.keys(skillWidths).length === 0) {
      const widths: SkillWidthsType = {};
      Object.entries(skills).forEach(([category, items]) => {
        widths[category] = items.map(() => Math.floor(Math.random() * 21) + 80);
      });
      setSkillWidths(widths);
    }
  }, [skills, skillWidths]);

  type Experience = {
    title: string;
    company: string;
    period: string;
    description: string;
    // achievements: string[];
  };

  const experiences: Experience[] = [
    {
      title: 'Gen AI Wing',
      company: 'Google Developers Group On Campus',
      period: 'Sept 2025 - Present',
      description: 'Core member in the GenAI field, with experience managing LinkedIn outreach, volunteering, and actively contributing to campaigns and study jams.',
    },
    {
      title: 'Member',
      company: 'Science and Technolgy Council',
      period: 'Aug 2025 - Present',
      description: 'Web Dev Team'
    },
    {
      title: 'Core Team Member',
      company: 'Yantrik',
      period: 'Apr 2025 - Sept 2025',
      description: 'Worked on a project: Unicycle'
    }
  ];

  type Project = {
    title: string;
    description: string;
    tech: string[];
  };

  const projects: Project[] = [
    {
      title: 'AI Email Assistant',
      description: 'A Streamlit web app that generates professional or daily use emails using the latest open-source AI models via the Groq API. Simply enter your requirements and instantly get high-quality email drafts and improvement suggestions.',
      tech: ['Streamlit', 'Groq API'],
    },
    {
      title: 'Memory Haven',
      description: 'Memory Haven is a full-stack web application where users can securely store personal memories (text, images, audio, or video) that are only accessible after a future unlock date. Think of it as a digital time capsule platform!',
      tech: ['React', 'Node.js', 'MongoDB', 'JWT Authentication'],
    },
    {
      title: 'SNTC Website',
      description: 'A website to manage club activities and schedule for SNTC, IIT Mandi.',
      tech: ['React', 'Next.js', 'Vercel'],
    },
    {
      title: 'BookMyShow',
      description: 'A website made using GenAI to book movie tickets online.',
      tech: ['React', 'Next.js', 'Vercel'],
    }
  ];

  type Contribution = {
    day: string;
    commits: number[];
  };

  const contributions: Contribution[] = [
    { day: 'Mon', commits: [3, 5, 2, 8, 0, 4, 6, 1, 3, 7, 5, 2] },
    { day: 'Tue', commits: [4, 2, 6, 3, 5, 1, 4, 8, 2, 5, 3, 6] },
    { day: 'Wed', commits: [2, 7, 4, 1, 6, 3, 5, 2, 7, 4, 6, 3] },
    { day: 'Thu', commits: [5, 3, 8, 2, 4, 7, 1, 5, 3, 8, 2, 5] },
    { day: 'Fri', commits: [6, 4, 3, 5, 2, 8, 4, 6, 1, 4, 7, 3] },
    { day: 'Sat', commits: [1, 2, 0, 3, 1, 2, 0, 3, 5, 1, 2, 4] },
    { day: 'Sun', commits: [2, 1, 3, 0, 2, 1, 4, 0, 2, 3, 1, 2] }
  ];

  const getCommitColor = (count: number): string => {
    if (count === 0) return 'bg-slate-800';
    if (count <= 2) return 'bg-cyan-900';
    if (count <= 4) return 'bg-cyan-700';
    if (count <= 6) return 'bg-cyan-500';
    return 'bg-cyan-400';
  };

  const scrollToSection = (id: string): void => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-30" />
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 211, 238, 0.08), transparent 40%)`
        }}
      />
      <div className="relative z-10">
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-cyan-900/30' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-2">
                <Terminal className="text-cyan-400" size={24} />
                <span className="text-xl font-mono font-bold text-cyan-400">devName</span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                {['Home', 'About', 'Experience', 'Skills', 'Projects', 'Contact'].map((item: string) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`px-4 py-2 text-sm font-mono transition-all duration-300 rounded ${
                      activeSection === item.toLowerCase()
                        ? 'text-cyan-400 bg-cyan-400/10'
                        : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-cyan-400">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-cyan-900/30">
              <div className="px-4 py-3 space-y-2">
                {['Home', 'About', 'Experience', 'Skills', 'Projects', 'Contact'].map((item: string) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="block w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-cyan-400 rounded font-mono"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <main>
          <section id="home" className="min-h-screen flex items-center justify-center px-4 pt-16">
            <div className="max-w-5xl mx-auto">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-cyan-400 font-mono">
                  <GitBranch size={20} />
                  <span className="text-sm">~/portfolio/home</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold">
                  <span className="text-slate-100">Hi, I'm </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                    Khushbu Sharma
                  </span>
                </h1>
                
                <div className="font-mono text-xl md:text-2xl text-slate-400 flex items-center gap-2 h-8">
                  <span className="text-cyan-400 animate-pulse">{'>'}</span>
                  <span className="min-w-max">
                    {displayText}
                    <span className="inline-block w-0.5 h-6 bg-cyan-400 ml-1 animate-pulse"></span>
                  </span>
                </div>
                
                <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                  Building scalable systems and crafting elegant solutions to complex problems. 
                  Passionate about distributed systems, performance optimization, and developer experience.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button onClick={() => scrollToSection('contact')} className="group px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono rounded transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/50">
                    <Terminal size={20} />
                    Get In Touch
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button className="px-6 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-mono rounded transition-all duration-300 flex items-center gap-2">
                    <Download size={20} />
                    Download CV
                  </button>
                  <a
                    href="https://github.com/Khushbu710"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 border border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-400 font-mono rounded transition-all duration-300 flex items-center gap-2"
                  >
                    <Github size={20} />
                    Github
                  </a>

                </div>

                <div className="grid grid-cols-1 gap-4 pt-8 max-w-fit">
                  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur">
                    <div className="text-2xl font-bold text-cyan-400">Indian Institue of Technology, Mandi</div>
                    <div className="text-sm text-slate-400 font-mono">2024-2028</div>
                  </div>
                  {/* <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur">
                    <div className="text-3xl font-bold text-cyan-400">30+</div>
                    <div className="text-sm text-slate-400 font-mono">Projects</div>
                  </div> */}
                  {/* <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur">
                    <div className="text-3xl font-bold text-cyan-400">1.2k</div>
                    <div className="text-sm text-slate-400 font-mono">Commits</div>
                  </div> */}
                </div>
              </div>
            </div>
          </section>

          <section id="about" className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-12">
                <span className="text-cyan-400 font-mono text-2xl">01.</span>
                <h2 className="text-4xl font-bold text-slate-100">About Me</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent ml-4"></div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <p className="text-lg text-slate-400 leading-relaxed">
                    I’m a second-year B.Tech student in Mechanical Engineering at IIT Mandi with a growing passion for technology and innovation. My interests lie strongly in Generative AI and AI agents, where I’ve worked on projects that explore practical applications of intelligent systems. Alongside AI, I also have hands-on experience in web development, focusing more on practical implementation rather than theory, which has allowed me to bring my ideas to life in real projects.
                  </p>
                  <p className="text-lg text-slate-400 leading-relaxed">
                    Along with technical skills, I have proficiency in Japanese language, which broadens my communication and cultural perspective. I’m passionate about continuous learning, exploring emerging technologies, and collaborating on impactful projects at the intersection of AI, engineering, and innovation.
                  </p>
                  
                  {/* <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-mono text-slate-400">Contribution Activity</span>
                      <span className="text-xs text-slate-500">Last 12 weeks</span>
                    </div>
                    {/* <div className="flex justify-center">
                      <img
                        src="https://ghchart.rshah.org/your-username"
                        alt="GitHub Contributions"
                        className="rounded-lg shadow-lg"
                      />
                    </div> */}
                    {/* <div className="flex items-center justify-end gap-2 mt-3 text-xs text-slate-500">
                      <span>Less</span>
                      <div className="flex gap-1">
                        {[0, 2, 4, 6, 8].map(level => (
                          <div key={level} className={`w-3 h-3 rounded-sm ${getCommitColor(level)}`} />
                        ))}
                      </div>
                      <span>More</span>
                    </div> */}
                  {/* </div>  */}
                </div>

                <div className="space-y-4">
                  {[
                    { icon: <Zap className="text-cyan-400" size={24} />, title: 'Performance First', desc: 'Optimizing for speed and efficiency' },
                    { icon: <Database className="text-cyan-400" size={24} />, title: 'Scalable Architecture', desc: 'Building systems that grow with demand' },
                    { icon: <GitCommit className="text-cyan-400" size={24} />, title: 'Clean Code', desc: 'Writing maintainable, testable code' },
                    { icon: <Star className="text-cyan-400" size={24} />, title: 'Innovation', desc: 'Exploring cutting-edge technologies' }
                  ].map((item, idx) => (
                    <div key={item.title} className="group p-6 bg-slate-900/30 border border-slate-800 hover:border-cyan-500/50 rounded-lg backdrop-blur transition-all duration-300 hover:translate-x-2">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1 text-slate-100">{item.title}</h3>
                          <p className="text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="experience" className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-12">
                <span className="text-cyan-400 font-mono text-2xl">02.</span>
                <h2 className="text-4xl font-bold text-slate-100">Experience</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent ml-4"></div>
              </div>

              <div className="space-y-6">
                {experiences.map((exp, idx) => (
                  <div key={exp.title} className="group relative p-8 bg-slate-900/30 border border-slate-800 hover:border-cyan-500/50 rounded-lg backdrop-blur transition-all duration-300">
                    <div className="absolute -left-3 top-8 w-6 h-6 bg-cyan-500 rounded-full border-4 border-slate-950 group-hover:scale-125 transition-transform"></div>
                    
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-100 mb-1">{exp.title}</h3>
                        <p className="text-lg text-cyan-400 font-mono">{exp.company}</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-800 text-slate-400 text-sm font-mono rounded mt-2 sm:mt-0">{exp.period}</span>
                    </div>
                    
                    <p className="text-slate-400 mb-4">{exp.description}</p>
                    
                    {/* <div className="space-y-2">
                      {exp.achievements.map((achievement, i) => (
                        <div key={achievement} className="flex items-start gap-2">
                          <GitCommit className="text-cyan-400 mt-1 flex-shrink-0" size={16} />
                          <span className="text-slate-400">{achievement}</span>
                        </div>
                      ))}
                    </div> */}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="skills" className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-12">
                <span className="text-cyan-400 font-mono text-2xl">03.</span>
                <h2 className="text-4xl font-bold text-slate-100">Tech Stack</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent ml-4"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(skills).map(([category, items]) => (
                  <div key={category} className="p-6 bg-slate-900/30 border border-slate-800 hover:border-cyan-500/50 rounded-lg backdrop-blur transition-all duration-300 group">
                    <h3 className="text-xl font-bold mb-4 text-cyan-400 font-mono flex items-center gap-2">
                      <Code size={20} />
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {items.map((skill, idx) => (
                        <div key={skill} className="group/item">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-slate-300">{skill}</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `100%` }} />

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="projects" className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-12">
                <span className="text-cyan-400 font-mono text-2xl">04.</span>
                <h2 className="text-4xl font-bold text-slate-100">Featured Projects</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent ml-4"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, idx) => (
                  <div key={project.title} className="group p-6 bg-slate-900/30 border border-slate-800 hover:border-cyan-500/50 rounded-lg backdrop-blur transition-all duration-300 hover:-translate-y-2 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                        <Code className="text-cyan-400" size={24} />
                      </div>
                      <button className="text-slate-400 hover:text-cyan-400 transition-colors">
                        <ExternalLink size={20} />
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-slate-100 group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 mb-4 text-sm leading-relaxed flex-grow">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech.map((tech, i) => (
                        <span key={tech} className="px-2 py-1 bg-slate-800 text-cyan-400 rounded text-xs font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    {/* Removed stars and forks display */}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="contact" className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-12">
                <span className="text-cyan-400 font-mono text-2xl">05.</span>
                <h2 className="text-4xl font-bold text-slate-100">Get In Touch</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 to-transparent ml-4"></div>
              </div>

              <div className="text-center mb-12">
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  My inbox is always open. Whether you have a question, want to collaborate on a project, 
                  or just want to say hi, I'll get back to you as soon as possible!
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: <Mail size={24} />, label: 'Email', value: 'khushbu.sharma7105@gmail.com', href: 'mailto:khushbu,sharma7105@gmail.com' },
                  { icon: <Linkedin size={24} />, label: 'LinkedIn', value: 'Khushbu Sharma', href: 'https://www.linkedin.com/in/khushbu-sharma-152440351/' },
                  { icon: <Github size={24} />, label: 'GitHub', value: '@Khushbu710', href: 'https://github.com/Khushbu710' }
                ].map((contact, idx) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    className="group p-6 bg-slate-900/30 border border-slate-800 hover:border-cyan-500/50 rounded-lg backdrop-blur transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 bg-cyan-500/10 rounded-lg mb-4 group-hover:bg-cyan-500/20 transition-colors text-cyan-400">
                        {contact.icon}
                      </div>
                      <p className="font-mono text-sm text-slate-500 mb-1">{contact.label}</p>
                      <p className="text-slate-300 font-mono">{contact.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-800 py-8 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-slate-500 font-mono text-sm mb-4">
              Thank you for visiting!
            </p>
            <p className="text-slate-600 font-mono text-xs">
              © 2025 Khushbu Sharma. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
