
export const SCORING_RUBRIC = [
  {
    score: 5,
    title: "The response exactly repeats the prompt.",
    details: [
      "The response is fully intelligible and is an exact repetition of the prompt."
    ]
  },
  {
    score: 4,
    title: "The response captures the meaning expressed in the prompt, but it is not an exact repetition.",
    details: [
      "Minor changes in words or grammar are present that do not substantially change the meaning of the prompt.",
      "For example: one or two function words may be missing or changed, a content word may be missing (in longer stimuli) or replaced with a related word, markers of tense/aspect/number may be missing or incorrect, or two words may be transposed.",
      "One or two content words may be ambiguous because of imprecise pronunciation. The speaker may self-correct, but successfully completes the response."
    ]
  },
  {
    score: 3,
    title: "The response is essentially full, but it does not accurately capture the original meaning.",
    details: [
      "The response contains a majority of the content words or ideas in the prompt.",
      "Multiple function words may be changed or missing; one or more content words may be missing or substantively changed.",
      "The response is a full sentence.",
      "In some cases, intelligibility issues cause occasional difficulty in understanding meaning. The speaker may struggle over a word or phrase or run words together, reducing intelligibility."
    ]
  },
  {
    score: 2,
    title: "The response is missing a significant part of the prompt and/or is highly inaccurate.",
    details: [
      "A large portion of the prompt is missing, and important original meaning is left out.",
      "The speaker may repeat the first part of the sentence. Then the speaker may stop or fill with inaccurate content and/or include the last few words.",
      "The response is not a self-standing sentence; meaning is fragmentary.",
      "Intelligibility is low; the response would be difficult to understand for a listener unfamiliar with the prompt."
    ]
  },
  {
    score: 1,
    title: "The response captures very little of the prompt or is largely unintelligible.",
    details: [
      "A minimal response of a few words is made; most of the prompt is missing.",
      "The response is recognizable as an attempt to repeat the prompt, but it is mostly unintelligible."
    ]
  },
  {
    score: 0,
    title: "No response OR the response is entirely unintelligible OR there is no English in the response OR the content is entirely unconnected to the prompt.",
    details: [
      'Consists only of phrases such as "I don\'t know".'
    ]
  }
];
