import { FaPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_ALL_CONTACTS_ROUTES, CREATE_CHANNEL_ROUTE, HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";
import { Check, X, Search } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const CreateChannel = () => {
  const { addChannel } = useAppStore();
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (newChannelModal) {
      loadContacts();
      setSelectedContacts([]);
      setChannelName("");
      setSearchTerm("");
    }
  }, [newChannelModal]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(allContacts);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredContacts(
        allContacts.filter((c) => c.label.toLowerCase().includes(lower))
      );
    }
  }, [searchTerm, allContacts]);

  const loadContacts = async () => {
    try {
      const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
        withCredentials: true,
      });
      if (response.data.contacts) {
        setAllContacts(response.data.contacts);
        setFilteredContacts(response.data.contacts);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const toggleContact = (contact) => {
    setSelectedContacts((prev) =>
      prev.find((c) => c.value === contact.value)
        ? prev.filter((c) => c.value !== contact.value)
        : [...prev, contact]
    );
  };

  const isSelected = (contact) =>
    selectedContacts.some((c) => c.value === contact.value);

  const createChannel = async () => {
    try {
      if (channelName.trim().length > 0 && selectedContacts.length > 0) {
        const response = await apiClient.post(
          CREATE_CHANNEL_ROUTE,
          {
            name: channelName.trim(),
            members: selectedContacts.map((c) => c.value),
          },
          { withCredentials: true }
        );
        if (response.status === 201) {
          setChannelName("");
          setSelectedContacts([]);
          setNewChannelModal(false);
          addChannel(response.data.channel);
        }
      }
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
            onClick={() => setNewChannelModal(true)}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
          Create New Channel
        </TooltipContent>
      </Tooltip>

      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogContent className="bg-[#1c1d25] border-none text-white w-[420px] max-w-[95vw] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-lg font-semibold">
              Create New Channel
            </DialogTitle>
            <DialogDescription className="text-neutral-400 text-sm">
              Name your channel and add members.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-6">
            {/* Channel name input */}
            <Input
              placeholder="Channel name"
              className="rounded-xl p-4 bg-[#2c2e3b] border border-white/5 text-white placeholder:text-neutral-500 focus-visible:ring-1 focus-visible:ring-purple-500"
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />

            {/* Selected chips */}
            {selectedContacts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map((contact) => (
                  <span
                    key={contact.value}
                    className="flex items-center gap-1 bg-purple-700/30 border border-purple-500/30 text-purple-200 text-xs px-2.5 py-1 rounded-full"
                  >
                    {contact.label}
                    <button
                      onClick={() => toggleContact(contact)}
                      className="text-purple-300 hover:text-white transition-colors ml-0.5"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search contacts */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#2c2e3b] border border-white/5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Contacts list */}
          <div className="mt-3 mx-6 mb-4 overflow-y-auto max-h-[220px] rounded-xl bg-[#22232f] border border-white/5 scrollbar-hidden">
            {filteredContacts.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-6">
                No contacts found
              </p>
            ) : (
              filteredContacts.map((contact) => {
                const selected = isSelected(contact);
                const initial = contact.label.charAt(0).toUpperCase();
                return (
                  <button
                    key={contact.value}
                    onClick={() => toggleContact(contact)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${selected
                        ? "bg-purple-700/20"
                        : "hover:bg-white/5"
                      }`}
                  >
                    {/* Avatar */}
                    {contact.image ? (
                      <Avatar className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
                        <AvatarImage
                          src={`${HOST}/${contact.image}`}
                          alt="profile"
                          className="object-cover w-full h-full bg-black"
                        />
                      </Avatar>
                    ) : (
                      <div
                        className={`uppercase w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 border ${getColor(contact.color)}`}
                      >
                        {initial}
                      </div>
                    )}

                    {/* Name */}
                    <span className="flex-1 text-sm text-white truncate">
                      {contact.label}
                    </span>

                    {/* Checkmark */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${selected
                        ? "bg-purple-600 border-purple-600"
                        : "border-neutral-600"
                        }`}
                    >
                      {selected && <Check size={11} className="text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-1">
            <Button
              onClick={createChannel}
              disabled={!channelName.trim() || selectedContacts.length === 0}
              className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl py-5 text-sm font-medium transition-all duration-200"
            >
              Create Channel
              {selectedContacts.length > 0 && (
                <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {selectedContacts.length}
                </span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
