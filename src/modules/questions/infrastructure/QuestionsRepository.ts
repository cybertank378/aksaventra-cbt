import type {
  CreateQuestionInputDTO,
  QuestionsFilterQueryDTO,
} from "../domain/dto/QuestionDTO";
import { QuestionEntity } from "../domain/entities/QuestionEntity";
import type { QuestionsRepositoryInterface } from "../domain/interfaces/QuestionsRepositoryInterface";

const initialBankQuestions: QuestionEntity[] = [
  new QuestionEntity(
    "qb-1",
    "MAT-MC-001",
    "Matematika",
    "XII",
    "multichoice",
    "Tentukan turunan pertama dari $f(x) = 3x^4 - 5x^2 + 7x - 2$!",
    2.5,
    undefined,
    [
      { id: "opt-1", label: "A", text: "$12x^3 - 10x + 7$", isCorrect: true },
      { id: "opt-2", label: "B", text: "$12x^3 - 5x + 7$", isCorrect: false },
      { id: "opt-3", label: "C", text: "$7x^3 - 10x + 7$", isCorrect: false },
      {
        id: "opt-4",
        label: "D",
        text: "$12x^4 - 10x^2 + 7$",
        isCorrect: false,
      },
    ],
    "Gunakan aturan turunan fungsi aljabar: d/dx(x^n) = n*x^(n-1).",
    new Date("2026-11-01T08:00:00Z"),
    new Date("2026-11-01T08:00:00Z"),
  ),
  new QuestionEntity(
    "qb-2",
    "FIS-MCMA-002",
    "Fisika",
    "XI",
    "mcma",
    "Manakah pernyataan berikut yang benar mengenai Hukum Termodinamika? (Pilih semua yang sesuai)",
    3.0,
    undefined,
    [
      {
        id: "opt-1",
        label: "A",
        text: "Energi tidak dapat diciptakan atau dimusnahkan (Kekekalan Energi)",
        isCorrect: true,
      },
      {
        id: "opt-2",
        label: "B",
        text: "Entropi total dari sistem terisolasi selalu meningkat",
        isCorrect: true,
      },
      {
        id: "opt-3",
        label: "C",
        text: "Nol mutlak dapat dicapai dalam jumlah siklus berhingga",
        isCorrect: false,
      },
      {
        id: "opt-4",
        label: "D",
        text: "Proses isokhorik berlangsung pada volume konstan",
        isCorrect: true,
      },
    ],
    "Hukum I adalah kekekalan energi, Hukum II menjelaskan entropi, dan proses isokhorik bervolume konstan.",
    new Date("2026-11-02T08:00:00Z"),
    new Date("2026-11-02T08:00:00Z"),
  ),
  new QuestionEntity(
    "qb-3",
    "KIM-TF-003",
    "Kimia",
    "X",
    "truefalse",
    "Larutan asam klorida (HCl) memiliki nilai pH lebih kecil dari 7 pada suhu 25°C.",
    2.0,
    undefined,
    [
      { id: "opt-1", label: "A", text: "Benar (True)", isCorrect: true },
      { id: "opt-2", label: "B", text: "Salah (False)", isCorrect: false },
    ],
    "HCl adalah asam kuat dengan pH < 7.",
    new Date("2026-11-03T08:00:00Z"),
    new Date("2026-11-03T08:00:00Z"),
  ),
  new QuestionEntity(
    "qb-4",
    "BIO-SA-004",
    "Biologi",
    "XII",
    "shortanswer",
    "Sebutkan organel sel yang menjadi pusat sintesis protein pada sel eukariotik!",
    2.5,
    undefined,
    [
      { id: "opt-1", label: "1", text: "Ribosom", isCorrect: true },
      { id: "opt-2", label: "2", text: "Ribosome", isCorrect: true },
    ],
    "Ribosom bertanggung jawab mentranslasi mRNA menjadi polipeptida protein.",
    new Date("2026-11-04T08:00:00Z"),
    new Date("2026-11-04T08:00:00Z"),
  ),
  new QuestionEntity(
    "qb-5",
    "FIS-NUM-005",
    "Fisika",
    "X",
    "numerical",
    "Sebuah benda bermassa 4 kg ditarik dengan gaya 20 N pada permukaan licin. Berapakah percepatan benda tersebut dalam m/s^2?",
    3.0,
    0.1,
    [{ id: "opt-1", label: "Kunci", text: "5.0", isCorrect: true }],
    "Gunakan Hukum II Newton: a = F / m = 20 / 4 = 5 m/s^2.",
    new Date("2026-11-05T08:00:00Z"),
    new Date("2026-11-05T08:00:00Z"),
  ),
  new QuestionEntity(
    "qb-6",
    "GEO-MT-006",
    "Geografi",
    "XI",
    "matching",
    "Jodohkan istilah lempeng tektonik berikut dengan karakteristik pergerakannya!",
    3.5,
    undefined,
    [
      {
        id: "opt-1",
        label: "Konvergen",
        text: "Dua lempeng saling bertumbukan",
        matchTarget: "Bertumbukan",
        isCorrect: true,
      },
      {
        id: "opt-2",
        label: "Divergen",
        text: "Dua lempeng saling menjauh",
        matchTarget: "Menjauh",
        isCorrect: true,
      },
      {
        id: "opt-3",
        label: "Transform",
        text: "Dua lempeng saling bergesekan menyamping",
        matchTarget: "Bergesekan",
        isCorrect: true,
      },
    ],
    "Batas lempeng konvergen bertumbukan, divergen menjauh, transform berpapasan.",
    new Date("2026-11-06T08:00:00Z"),
    new Date("2026-11-06T08:00:00Z"),
  ),
  new QuestionEntity(
    "qb-7",
    "IND-CL-007",
    "Bahasa Indonesia",
    "XII",
    "cloze",
    "Penulis artikel opini harus menyajikan fakta yang [1] agar pembaca dapat mempercayai gagasan yang [2] secara logis.",
    3.0,
    undefined,
    [
      { id: "opt-1", label: "1", text: "akurat", isCorrect: true },
      { id: "opt-2", label: "2", text: "disampaikan", isCorrect: true },
    ],
    "Konteks kalimat ilmiah menuntut keakuratan data dan kelogisan penyampaian.",
    new Date("2026-11-07T08:00:00Z"),
    new Date("2026-11-07T08:00:00Z"),
  ),
  new QuestionEntity(
    "qb-8",
    "SOS-ES-008",
    "Sosiologi",
    "XII",
    "essay",
    "Jelaskan dampak globalisasi terhadap pelestarian kearifan lokal di kalangan generasi muda!",
    5.0,
    undefined,
    [],
    "Rubrik penilaian mencakup: pemahaman konsep, contoh konkret, dan solusi solutif.",
    new Date("2026-11-08T08:00:00Z"),
    new Date("2026-11-08T08:00:00Z"),
  ),
];

export class QuestionsRepository implements QuestionsRepositoryInterface {
  private questions: QuestionEntity[] = [...initialBankQuestions];

  async findMany(filter?: QuestionsFilterQueryDTO): Promise<QuestionEntity[]> {
    let result = [...this.questions];

    if (filter?.subject && filter.subject !== "ALL") {
      result = result.filter(
        (q) => q.subject.toLowerCase() === filter.subject?.toLowerCase(),
      );
    }

    if (filter?.gradeLevel && filter.gradeLevel !== "ALL") {
      result = result.filter((q) => q.gradeLevel === filter.gradeLevel);
    }

    if (filter?.type && filter.type !== ("ALL" as unknown)) {
      result = result.filter((q) => q.type === filter.type);
    }

    if (filter?.search?.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.stem.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q),
      );
    }

    return result;
  }

  async findById(id: string): Promise<QuestionEntity | null> {
    const q = this.questions.find((item) => item.id === id);
    return q || null;
  }

  async create(data: CreateQuestionInputDTO): Promise<QuestionEntity> {
    const id = `qb-${Date.now()}`;
    const code = `${data.subject.slice(0, 3).toUpperCase()}-${data.type.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();

    const entity = new QuestionEntity(
      id,
      code,
      data.subject,
      data.gradeLevel,
      data.type,
      data.stem,
      data.points,
      data.tolerance,
      data.options,
      data.explanation,
      now,
      now,
    );

    this.questions.unshift(entity);
    return entity;
  }

  async delete(id: string): Promise<boolean> {
    const before = this.questions.length;
    this.questions = this.questions.filter((q) => q.id !== id);
    return this.questions.length < before;
  }
}
