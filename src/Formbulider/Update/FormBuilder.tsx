import React, { useState } from "react";

interface InputField {
  id: number;
  type: string;
  label: string;
  placeholder?: string;
  value?: any;
  options?: string[];
}

interface FormBuilderProps {
  acceptValue: string;
  onAddField?: (field: InputField) => void;
  renderFieldOnly?: boolean; // For rendering pre-defined fields
  input?: InputField;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  acceptValue,
  onAddField,
  renderFieldOnly = false,
  input,
}) => {
  const [currentField, setCurrentField] = useState<InputField | null>(null);

  const startAddingField = () => {
    const newField: InputField = {
      id: Date.now(),
      type: acceptValue,
      label: "",
      placeholder: "",
      options: acceptValue === "Checkbox" || acceptValue === "List" ? [] : undefined,
      value: acceptValue === "Checkbox" ? false : "",
    };
    setCurrentField(newField);
  };

  const finalizeField = () => {
    if (currentField && onAddField) {
      onAddField(currentField);
      setCurrentField(null);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    if (currentField) {
      setCurrentField({ ...currentField, [key]: value });
    }
  };

  const renderField = (field: InputField) => {
    switch (field.type) {
      case "String":
        return (
          <div>
            <label>{field.label || "String Input"}:</label>
            <input
              type="text"
              placeholder={field.placeholder || "Enter a string"}
              value={field.value}
              onChange={(e) => handleConfigChange("value", e.target.value)}
            />
          </div>
        );
      case "Number":
        return (
          <div>
            <label>{field.label || "Number Input"}:</label>
            <input
              type="number"
              placeholder={field.placeholder || "Enter a number"}
              value={field.value}
              onChange={(e) => handleConfigChange("value", e.target.value)}
            />
          </div>
        );
      case "Checkbox":
        return (
          <div>
            <label>{field.label || "Checkbox"}:</label>
            <input
              type="checkbox"
              checked={field.value}
              onChange={(e) => handleConfigChange("value", e.target.checked)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (renderFieldOnly && input) {
    return <>{renderField(input)}</>;
  }

  return (
    <div>
      {currentField ? (
        <div>
          <label>
            Label:
            <input
              type="text"
              placeholder="Enter label"
              value={currentField.label}
              onChange={(e) => handleConfigChange("label", e.target.value)}
            />
          </label>
          {["String", "Number"].includes(currentField.type) && (
            <label>
              Placeholder:
              <input
                type="text"
                placeholder="Enter placeholder"
                value={currentField.placeholder}
                onChange={(e) => handleConfigChange("placeholder", e.target.value)}
              />
            </label>
          )}
          <button onClick={finalizeField}>Add Field</button>
        </div>
      ) : (
        <button onClick={startAddingField}>Add {acceptValue} Input</button>
      )}
    </div>
  );
};

export default FormBuilder;
