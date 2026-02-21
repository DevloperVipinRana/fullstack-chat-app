import { FaPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
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
import Lottie from "react-lottie";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import { HOST, SEARCH_CONTACTS_ROUTES, GET_ALL_CONTACTS_ROUTES } from "@/utils/constants";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store"

const NewDM = () => {
  const { setSelectedChatType, setSelectedChatData } = useAppStore();
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load all existing DM contacts when dialog opens
  useEffect(() => {
    if (openNewContactModal) {
      loadAllContacts();
    } else {
      setSearchedContacts([]);
      setIsSearching(false);
    }
  }, [openNewContactModal]);

  const loadAllContacts = async () => {
    try {
      const response = await apiClient.get(GET_ALL_CONTACTS_ROUTES, {
        withCredentials: true,
      });
      if (response.data.contacts) {
        // getAllContacts now returns full user details
        setAllContacts(
          response.data.contacts.map((c) => ({
            _id: c.value,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            color: c.color,
            image: c.image,
          }))
        );
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const searchContacts = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      setSearchedContacts([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await apiClient.post(
        SEARCH_CONTACTS_ROUTES,
        { searchTerm },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data.contacts) {
        // searchContacts returns full user objects — pass them through directly
        setSearchedContacts(
          response.data.contacts.map((c) => ({
            _id: c._id,
            firstName: c.firstName || "",
            lastName: c.lastName || "",
            email: c.email,
            color: c.color,
            image: c.image,
          }))
        );
      }
    } catch (error) {
      console.log({ error });
    }
  };

  // Contacts to display: search results when searching, else all contacts
  const displayedContacts = isSearching ? searchedContacts : allContacts;

  const selectNewContact = (contact) => {
    setOpenNewContactModal(false);
    setSelectedChatType("contact");
    setSelectedChatData(contact);
    setSearchedContacts([]);
    setIsSearching(false);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <FaPlus
            className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
            onClick={() => setOpenNewContactModal(true)}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
          Select New Contact
        </TooltipContent>
      </Tooltip>

      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className="bg-[#1c1d25] border-none text-white w-[420px] max-w-[95vw] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-lg font-semibold">New Direct Message</DialogTitle>
            <DialogDescription className="text-neutral-400 text-sm">
              Search or select someone to message.
            </DialogDescription>
          </DialogHeader>

          {/* Search input with icon */}
          <div className="px-6 relative">
            <Search
              size={15}
              className="absolute left-9 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search contacts..."
              onChange={(e) => searchContacts(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#2c2e3b] border border-white/5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Contacts list */}
          <div className="mt-3 mx-6 mb-6 overflow-y-auto max-h-[300px] rounded-xl bg-[#22232f] border border-white/5 scrollbar-hidden">
            {displayedContacts.length > 0 ? (
              displayedContacts.map((contact) => {
                const initial = (contact.firstName || contact.email || "?").charAt(0).toUpperCase();
                const displayName =
                  contact.firstName && contact.lastName
                    ? `${contact.firstName} ${contact.lastName}`
                    : contact.firstName || contact.email;
                return (
                  <button
                    key={contact._id}
                    onClick={() => selectNewContact(contact)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
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
                        className={`uppercase w-9 h-9 text-sm font-semibold border flex items-center justify-center rounded-full flex-shrink-0 ${getColor(contact.color)}`}
                      >
                        {initial}
                      </div>
                    )}

                    {/* Name + email */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-white truncate">{displayName}</span>
                      {contact.email && contact.firstName && (
                        <span className="text-xs text-neutral-400 truncate">{contact.email}</span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : isSearching ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Lottie isClickToPauseDisabled height={70} width={70} options={animationDefaultOptions} />
                <p className="text-neutral-500 text-sm">No contacts found</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Lottie isClickToPauseDisabled height={70} width={70} options={animationDefaultOptions} />
                <p className="text-neutral-500 text-sm">
                  Hi<span className="text-purple-400">!</span> Search new{" "}
                  <span className="text-purple-400">Contact.</span>
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDM;
