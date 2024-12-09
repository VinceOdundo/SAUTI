const PollOption = ({ poll, onChange }) => {
  const addOption = () => {
    onChange({
      ...poll,
      options: [...poll.options, ""],
    });
  };

  const removeOption = (index) => {
    const newOptions = poll.options.filter((_, i) => i !== index);
    onChange({ ...poll, options: newOptions });
  };

  const updateOption = (index, value) => {
    const newOptions = [...poll.options];
    newOptions[index] = value;
    onChange({ ...poll, options: newOptions });
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Poll question"
        value={poll.question}
        onChange={(e) => onChange({ ...poll, question: e.target.value })}
        className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg"
        required
      />

      {poll.options.map((option, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            className="flex-1 bg-dark-600 text-white px-4 py-2 rounded-lg"
            required
          />
          {poll.options.length > 2 && (
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="text-red-500 hover:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {poll.options.length < 4 && (
        <button
          type="button"
          onClick={addOption}
          className="text-primary-500 hover:text-primary-400"
        >
          Add Option
        </button>
      )}
    </div>
  );
};

export default PollOption;
