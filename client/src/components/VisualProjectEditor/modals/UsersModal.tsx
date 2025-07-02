import React, { useState } from 'react';
import { X, Users, Check, Edit, Plus } from 'lucide-react';

interface UserField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  optional?: boolean;
  propOptions: {
    required?: boolean;
    unique?: boolean;
    nullable?: boolean;
    minlength?: number;
    maxlength?: number;
    default?: string;
    validation?: string;
  };
}

interface UsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: { userFields: Partial<UserField[]> }) => void;
}

const UsersModal: React.FC<UsersModalProps> = ({ isOpen, onClose, onSave }) => {
  const defaultFields: UserField[] = [
    { name: 'email', type: 'string', propOptions: { required: true, unique: true } },
    { name: 'password', type: 'string', optional: true, propOptions: { nullable: true } },
    { name: 'username', type: 'string', propOptions: {} },
  ];

  const [fields, setFields] = useState<UserField[]>(defaultFields);
  const [editField, setEditField] = useState<UserField | null>(null);
  const [showModal, setShowModal] = useState(false);

  const isSystemField = (name: string) => name === 'email' || name === 'password';

  const handleSave = () => {
    console.log('Users Config (full):', { userFields: fields });
    onSave?.({ userFields: fields });
    onClose();
  };

  const openFieldModal = (field?: UserField) => {
    setEditField(field || { name: '', type: 'string', propOptions: {} });
    setShowModal(true);
  };

  const saveField = () => {
    if (!editField?.name.trim()) return;

    const isEditing = fields.some((f) => f.name === editField.name);
    if (isEditing) {
      setFields((prev) => prev.map((f) => (f.name === editField.name ? editField : f)));
    } else {
      setFields((prev) => [...prev, editField]);
    }
    setShowModal(false);
  };

  const removeField = (name: string) => {
    if (!isSystemField(name)) {
      setFields((prev) => prev.filter((f) => f.name !== name));
    }
  };

  const updateField = (updates: Partial<UserField>) => {
    setEditField((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updatePropOptions = (key: string, value: unknown) => {
    setEditField((prev) =>
      prev
        ? {
            ...prev,
            propOptions: { ...prev.propOptions, [key]: value || undefined },
          }
        : null,
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            User Fields
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fields List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">{fields.length} fields defined</span>
            <button
              onClick={() => openFieldModal()}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {fields.map((field) => (
              <div key={field.name} className="rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{field.name}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {field.type}
                      </span>
                      {field.optional && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                          Optional
                        </span>
                      )}
                      {isSystemField(field.name) && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          System
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs">
                      {Object.entries(field.propOptions).map(([key, value]) => (
                        <span key={key} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => openFieldModal(field)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!isSystemField(field.name) && (
                      <button
                        onClick={() => removeField(field.name)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 bg-gray-50">
          <button onClick={onClose} className="px-3 py-1 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>

      {/* Field Edit Modal */}
      {showModal && editField && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-60"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4">
              <h3 className="font-bold">
                {fields.some((f) => f.name === editField.name) ? 'Edit' : 'Add'} Field
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Name & Type */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Field name"
                  value={editField.name}
                  onChange={(e) => updateField({ name: e.target.value })}
                  disabled={isSystemField(editField.name)}
                  className="border-b rounded px-2 py-1 text-sm disabled:bg-gray-100"
                />
                <select
                  value={editField.type}
                  onChange={(e) => updateField({ type: e.target.value as UserField['type'] })}
                  disabled={isSystemField(editField.name)}
                  className="border-b rounded px-2 py-1 text-sm disabled:bg-gray-100"
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                </select>
              </div>

              {/* Optional */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editField.optional || false}
                  onChange={(e) => updateField({ optional: e.target.checked })}
                />
                Optional field
              </label>

              {/* Properties */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editField.propOptions.required || false}
                    onChange={(e) => updatePropOptions('required', e.target.checked)}
                  />
                  Required
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editField.propOptions.unique || false}
                    onChange={(e) => updatePropOptions('unique', e.target.checked)}
                  />
                  Unique
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editField.propOptions.nullable || false}
                    onChange={(e) => updatePropOptions('nullable', e.target.checked)}
                  />
                  Nullable
                </label>
              </div>

              {/* Length constraints for strings */}
              {editField.type === 'string' && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min length"
                    value={editField.propOptions.minlength || ''}
                    onChange={(e) =>
                      updatePropOptions('minlength', parseInt(e.target.value) || undefined)
                    }
                    className="border-b rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max length"
                    value={editField.propOptions.maxlength || ''}
                    onChange={(e) =>
                      updatePropOptions('maxlength', parseInt(e.target.value) || undefined)
                    }
                    className="border-b rounded px-2 py-1 text-sm"
                  />
                </div>
              )}

              {/* Default & Validation */}
              {editField.name !== 'password' && (
                <input
                  placeholder="Default value"
                  value={editField.propOptions.default || ''}
                  onChange={(e) => updatePropOptions('default', e.target.value)}
                  className="w-full border-b rounded px-2 py-1 text-sm"
                />
              )}

              {editField.type === 'string' && (
                <input
                  placeholder="Validation regex"
                  value={editField.propOptions.validation || ''}
                  onChange={(e) => updatePropOptions('validation', e.target.value)}
                  className="w-full border-b rounded px-2 py-1 text-sm"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 p-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveField}
                disabled={!editField.name.trim()}
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersModal;
