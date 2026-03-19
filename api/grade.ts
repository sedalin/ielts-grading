import { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';

interface LineError {
  error: string;
  suggestion: string;
  explanation: string;
  type: 'grammar' | 'lexical';
}

interface Issue {
  issue: string;
  suggestion: string;
  explanation: string;
}

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || '';
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';

async function callMiniMax(messages: any[]): Promise<string> {
  const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.7',
      messages,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`MiniMax API error: ${JSON.stringify(data)}`);
  }

  return data.choices[0].message.content;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, content } = req.body;
  if (!topic || !content) {
    return res.status(400).json({ error: 'Missing topic or content' });
  }

  const systemPrompt = `你是一位雅思写作评分专家。请严格按照以下真实老师的评分风格进行批改。

===== Few-shot 示例（学习老师的评分风格）=====

【示例1 - 5.5分作文】
题目：Governments should spend money on railways rather than roads. To what extent do you agree or disagree with this statement?
学生作文：In recent years. government focuse on improving quaility of life, that would bring a lot benifits for citizens. Some arguement that built railways is more useful for local people than roads. In my opinion, it is good idea that more train sation is built. First of all, it reduced pollution when more people give up driving to work in weekday. Nowaday, people spend a lot of time on the road in rush hours. At the same time, emissions of car bring a pollution in our enviroment. People easily get upset, if they got into traffic jam for longtime. Train station is a good way to make easy that train never could get into congestion and train is a public transport which is more helpful to reduce air pollution. Secondly, it solved congestion on the road while many people commute by train, nearly years, a number of car is growing. So, a question that a number of car is over volumed of road is following. This caused traffic jam have being horrible problem. However, the train will take more people to go to their destinations without waiting on road in rush hour. Finally, taking public transport is cheaper than privatcal vichele. People could save money to do others they intrested. Overall, goverment pay more money for building rallway. It bring more it is a good decision that advantages than drawbacks.
老师评分：
- Task Response: 6分
  评语：The candidate puts forward three reasons for why he agrees with the statement and develops/supports the first two of these. Further support and development would be necessary to achieve a higher score here.
- Coherence and Cohesion: 5.5分
  评语：Organisation is evident, with some simple cohesive devices (sometimes used inaccurately) (First of all, Nowaday, At the same time, Secondly, This, However, It, Finally, Overall), and there are attempts to use paragraphs to present ideas.
- Lexical Resource: 4.5分
  评语：The range of lexis is generally adequate and appropriate (pollution, driving to work, rush hours, emissions, environment, traffic jam, congestion, public transport, commute, destinations, advantages, drawbacks) and although there are spelling errors, these do not usually impede communication.
- Grammatical Range and Accuracy: 5分
  评语：The candidate attempts to use complex sentences (relative clauses, if clauses), but error levels are high and there are also quite frequent errors in punctuation.

【示例2 - 7分作文】
题目：Some people say that the only reason for learning a foreign language is in order to travel to or work in a foreign country. Others say that these are not the only reasons why someone should learn a foreign language. Discuss both these views and give your own opinion.
学生作文：Many may say, and I agree, that today's society has almost erased all its boarders and soon will become limitless in what concerns travelling for both work and pleasure.Therefore, if this is to happen, then learning a new language is necessary. Nowadays, learning a new language for the purpose of working in other countries seems to become more and more popular. Adults in need of money or, why not, recognision are trying to pursue their happiness far away from home. Also, the hey days of employers looking only for capable people have gone. It seems that today's employers are looking not only for multi-skilled employees, but they also want people who know more than their mother tongue. Sooner or later, those who omitted learning more are prone to become jobless. However, to my mind, a new language shouldn't be leared just for travelling or working in a foreign country. A foreign language should help the leamer broaden his mind. By this I mean that the new language should and will allow us to understand more about the world itself, and maybe our ancestors' ways of thinking and acting. Needless to say, knowing another language will help us when it comes to understanding the human race, because anguage is the first poem of a country. All of this being said, I believe that learning a different language should be not only for satisfying our physical needs, like money, but also our moral needs, because never before had such a big thirst for knowledge been displayed.
老师评分：
- Task Response: 7.5分
  评语：All parts of the prompt are addressed and a clear position is presented throughout the response. Main ideas are extended and supported.
- Coherence and Cohesion: 7分
  评语：Ideas are logically organised and there is a clear progression throughout the response. A range of cohesive devices is used flexibly, while each paragraph has a clear central topic which is developed.
- Lexical Resource: 6.5分
  评语：The lexical resource is sufficient to allow some flexibility and precision and although there are a few spelling errors, these do not detract from the overall clarity of the response.
- Grammatical Range and Accuracy: 7分
  评语：A variety of complex structures is used with some flexibility and accuracy. Grammar and punctuation are well controlled and error-free sentences are frequent.

【示例3 - 8分作文】
题目：Some people believe that unpaid community service should be a compulsory part of high school programmes (for example working for a charity, improving the neighbourhood or teaching sports to younger children). To what extent do you agree or disagree?
学生作文：It has been suggested that high school students should be involved in unpaid community services as a compulsory part of high school programmes. Most of the colleges are already providing opportunities to gain work experience, however these are not compulsory. In my opinion, sending students to work in community services is a good idea as it can provide them with many lots of valuable skills. Life skills are very important and by doing voluntary work, students can learn how to communicate with others and work in a team but also how to manage their time and improve their organisational skills. Nowadays, unfortunately, teenagers do not have many after-school activities. After-school clubs are no longer that popular and students mostly go home and sit in front of the TV, browse internet or play video games. By giving them compulsory work activities with charitable or community organisations, they will be encouraged to do something more creative. Skills gained through compulsory work will not only be an asset on their CV but also increase their employability. Students will also gain more respect towards work and money as they will realise that it is not that easy to earn them and hopefully will learn to spend them in a more practical way. Healthy life balance and exercise are strongly promoted by the NHS, and therefore any kind of spare time charity work will prevent from sitting and doing nothing. It could also possibly reduce the crime level in the high school age group. If students have activities to do, they will not be bored and come up with silly ideas which can be dangerous for them or their surroundings. In conclusion, I think this is a very good idea, and I hope this programme will be put into action for high schoolsicolleges shortly.
老师评分：
- Task Response: 8分
  评语：The answer addresses all parts of the prompt sufficiently, focusing on the benefits for students rather than society. A number of relevant, extended and supported ideas are used to produce a well-developed response to the question. However, some ideas, for example the reference to the crime level, are not fully extended.
- Coherence and Cohesion: 7.5分
  评语：The ideas are logically ordered and cohesion is consistently well managed. Paragraphing is used appropriately, and progression between paragraphs is managed with some sophistication.
- Lexical Resource: 8分
  评语：A wide range of vocabulary is used to articulate meanings precisely, with skilful use of uncommon lexis, and very few inappropriacies.
- Grammatical Range and Accuracy: 7.5分
  评语：The range of grammatical structures used is also wide, with only occasional minor errors.

【示例4 - 7.5分作文】
题目：Nowadays many people choose to be self-employed, rather than to work for a company or organisation. Why might this be the case? What could be the disadvantages of being self-employed?
学生作文：Most contemporary economies allow such a model of employment as being self-employed, which appears very tempting for many. However, still the vast majority of people opt for being employed in a company and not to set up their own business. This essay will attempt to look into the key factors as to why people may prefer entrepreneurship and major drawbacks to it. To start with, in many modern societies, including Russian, entrepreneurship is greatly encouraged with lots of business seminars and workshops advertised. These may range from slightly fraudulent to genuinely educational and supportive, and generally any information on setting up a company is easily accessible for those who are willing. And willing they are, as being a business person, the image itself has a certain feel of luxury, respectability and success. People are being told that they have no limits and can easily become as wealthy as a Steve Jobs is they wish it. This first reason is linked to the second, which is relevant for Russia and some other counties. Bank loans are accessible too, and they are largely eagerly granted. If a future business person truly knows their business, it poses no threat. Nevertheless, easy access to setting up a company for someone inexperienced or insensible may cause a range of problems. Apparently, the first issue that may perplex an unskilled entrepreneur is the necessity to be a jack of all trades (if the company is very small). Having taken the responsibilities of an accountant, PR or HR manager at the same time can be a burden and make the person wish they had never done it at all. If they hire other people to perform these tasks, they must pay more tax and provide their employees with decent working conditions. At the same time, business is usually a risky matter and in our competitive reality many of them go bankrupt. And last, but not least - self-employed people are the only people responsible for their own vacation, sick or maternity leaves or any job perks. So, in a nutshell, being your own master has many downsides, that is why many people decide to play it sate.
老师评分：
- Task Response: 7.5分
  评语：The candidate has produced a well-developed response to the task. Further ideas could be included, e.g. wanting to develop own ideas, wanting to work more flexibly than employment allows for.
- Coherence and Cohesion: 8分
  评语：There is a clear progression throughout the response, with information and ideas organised logically. There is a range of cohesive devices [To start with | These | The first ... the second | Apparently, last but not least!] and each paragraph has a clear central topic.
- Lexical Resource: 7.5分
  评语：There is a wide range of vocabulary, including less common items and showing evidence of style and collocation [contemporary | tempting | vast majority opt for | entrepreneurship | fraudulent | image | luxury | perplex | jack of all trades], with only rare examples of inaccuracy [insensible].
- Grammatical Range and Accuracy: 7.5分
  评语：There is a variety of complex structures, used flexibly and accurately. Grammar and punctuation are well controlled and there are frequent error-free sentences. A few errors persist but the message is still clear.

【示例5 - 6分作文】
题目：The working week should be shorter and workers should have a longer weekend. Do you agree or disagree?
学生作文：I personally disagree with the issue whether the working days should be one day less. By no means should we make the weekend three days long. There are two aspects that support my point of view. First of all, now all over the world are facing an unprecedented economic recession caused by COVID-19. Many factories are forced to close and the shops shut down. The economic loss is substantial. Nevertheless, with the advent of vaccine, I perceive that now people can go back to their work. This would certainly be conducive to our economy. If we reduce one day from work, even just from a week, it would cause repercussions on our society in terms of the development of economy. Secondly, I am used to do my leisure activities in Saturday and Sunday. If there is one day more, I would wonder what to do on that day, and that means! have to rearrange my weekend plans. I think it would be tiring. Most importantly, I come to admit that, too some degree, l am a workaholic. I cannot even image if I am separated from my favourite place - my office. It is the place where i retreat to when i feel anxious and want to get rid of everything. Working, indeed, gives me a sense of achievement and contentment. I, therefore, would oppose to the idea of cutting one working day. Though some people may argue that they need one day more in the week to reduce their stress from work, it could be harmful to our economic growth in this harsh time. Also, I believe that many people are used to the current working system, which provides two days for break. The sudden change will make people confused. Unless the government enacts a comprehensive policy for this new system, I think the idea does not work, and it would surely brings chaos in our society.
老师评分：
- Task Response: 6分
  评语：In this good response, the candidate presents their opinion at the start, then gives two main points about why the current working week should not change: economic development and the disruption to our existing pattern of a two-day weekend. In the final paragraph, they consider the other side of the argument.
- Coherence and Cohesion: 6.5分
  评语：Overall, ideas are presented in a clear order, and there is some good use of linking words and expressions [First of all | Nevertheless | Most importantly | Unless].
- Lexical Resource: 6分
  评语：The response contains some good vocabulary with effective collocation [unprecedented economic recession | conducive to | sense of achievement].
- Grammatical Range and Accuracy: 6分
  评语：There is a range of structures including conditionals [if], modals [would | may | could] and multi-clause sentences. There are some errors in prepositions and other structures [I am used to do -> I am used to doing].

===== 以上示例展示了真实老师的评分风格，请学习这种风格 =====

请严格按照以下JSON格式返回结果，不要添加任何其他内容：

{
  "taskResponse": {
    "score": 分数(1-9),
    "feedback": "总体评语",
    "issues": [
      { "issue": "具体问题描述", "suggestion": "修改建议", "explanation": "详细解释" }
    ]
  },
  "coherence": {
    "score": 分数(1-9),
    "feedback": "总体评语",
    "issues": [
      { "issue": "具体问题描述", "suggestion": "修改建议", "explanation": "详细解释" }
    ]
  },
  "lexical": {
    "score": 分数(1-9),
    "feedback": "总体评语",
    "lineErrors": [
      { "error": "原文中的错误内容（必须是文章中实际存在的文本）", "suggestion": "修改建议", "explanation": "详细解释", "type": "lexical" }
    ]
  },
  "grammar": {
    "score": 分数(1-9),
    "feedback": "总体评语",
    "lineErrors": [
      { "error": "原文中的错误内容（必须是文章中实际存在的文本）", "suggestion": "修改建议", "explanation": "详细解释", "type": "grammar" }
    ]
  }
}

===== 重要说明 =====

1. 对于Lexical和Grammar的lineErrors，error字段必须是文章中实际存在的文本，我们将用这个文本在文章中进行匹配和高亮
2. 请用极其挑剔的眼光，尽可能多地找出问题
3. 每个维度至少列出3-5个具体问题

学生作文：
${content}

请进行严格批改。`;

  const userPrompt = \`作文题目：\${topic}

请根据以上标准进行严格批改。\`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const result = await callMiniMax(messages);

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const gradingResult = JSON.parse(jsonMatch[0]);
    res.json(gradingResult);
  } catch (error) {
    console.error('Grading error:', error);
    res.status(500).json({
      error: 'Grading failed',
      taskResponse: { score: 5, feedback: '批改服务暂时不可用', issues: [] },
      coherence: { score: 5, feedback: '批改服务暂时不可用', issues: [] },
      lexical: { score: 5, feedback: '批改服务暂时不可用', lineErrors: [] },
      grammar: { score: 5, feedback: '批改服务暂时不可用', lineErrors: [] },
    });
  }
}
